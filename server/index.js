// C:\LostFinderProject\server\index.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import dotenv from 'dotenv';
import {
  gameDb,
  getUserProfile,
  updateUserCoins,
  addCoins,
  useCoins,
  getKoreanPuzzle,
  getEnglishPuzzle,
  saveProgress,
  recordHintUsage,
  purchaseAdRemoval,
  purchaseCoins,
} from './game-db.js';

// 환경변수 로드
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// 분실물 데이터 저장소 (실제로는 DB 사용)
let lostItems = [];

// 성공 사례 데이터 저장소
let successStories = [];

/** ★★★ 핵심: 바디 파서 2종 반드시 활성화 ★★★ */
app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded
app.use(express.json());                           // application/json

/** CORS (프론트 localhost:3000과 쿠키 공유) */
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());

/** 파일 업로드 설정 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  }
});

/** 정적 파일 서빙 (업로드된 이미지) */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/** 인증 라우트 */
app.use('/auth', authRouter);

/** 건강 체크 */
app.get('/api/health', (req, res) => res.json({ ok: true }));

/**
 * 로그인
 * - 클라이언트가 어떤 키 이름으로 보내든 정상 인식되게 동의어 처리
 * - 실제 검증 로직은 기존대로 바꾸시면 됩니다(샘플은 단순 비교).
 */
app.post('/api/login', async (req, res) => {
  // 모든 오류를 잡아서 처리
  try {
    console.log('=== 로그인 요청 시작 ===');
    
    const b = req.body || {};
    const email = b.email ?? b.user_email ?? b.username;
    const password = b.password ?? b.pw;
    
    console.log('파싱된 데이터:', { email: email ? email.substring(0, 20) + '...' : '(없음)', password: password ? '***' : '(없음)' });

    if (!email || !password) {
      console.log('❌ 이메일/비밀번호 누락');
      return res.status(400).json({ message: '이메일/비밀번호가 없습니다.' });
    }

    try {
      // 실제 데이터베이스에서 사용자 확인
      const { db } = await import('./db.js');
      const { hashPassword } = await import('./utils/hash.js');
      
      const pwHash = hashPassword(password || '');
      
      // Promise로 래핑하여 에러 처리 개선
      await new Promise((resolve, reject) => {
        try {
          // name 또는 username 컬럼 모두 지원 (실제로는 username만 있음)
          db.get(
            `SELECT id, email, username FROM users WHERE email=? AND password_hash=?`,
            [email, pwHash],
            (err, user) => {
              try {
                if (err) {
                  console.error('❌ DB 오류:', err.message);
                  // DB 오류는 비밀번호 오류로 처리하여 보안 유지
                  if (!res.headersSent) {
                    res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
                  }
                  resolve(null);
                  return;
                }
                
                if (!user) {
                  console.log('❌ 사용자를 찾을 수 없음 또는 비밀번호 불일치');
                  if (!res.headersSent) {
                    res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
                  }
                  resolve(null);
                  return;
                }
                
                // 성공: 세션/토큰 등 원하는 방식으로 발급
                // name 또는 username 중 사용 가능한 것 사용
                const userName = user.name || user.username || user.email?.split('@')[0] || '사용자';
                const userData = { 
                  id: String(user.id), // User 타입이 id를 string으로 기대
                  email: user.email, 
                  name: userName,
                  username: userName // 호환성을 위해 둘 다 설정
                };
                
                if (!res.headersSent) {
                  res.cookie('token', 'dummy', { httpOnly: true, sameSite: 'lax' });
                  res.json({ ok: true, user: userData });
                  console.log('✅ 로그인 성공:', { email: email.substring(0, 20) + '...', userId: user.id });
                }
                resolve(user);
              } catch (innerErr) {
                console.error('❌ 응답 처리 중 오류:', innerErr);
                if (!res.headersSent) {
                  res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
                }
                resolve(null);
              }
            }
          );
        } catch (queryErr) {
          console.error('❌ 쿼리 실행 중 오류:', queryErr);
          if (!res.headersSent) {
            res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
          }
          resolve(null);
        }
      });
    } catch (importError) {
      console.error('❌ 모듈 import 오류:', importError);
      if (!res.headersSent) {
        return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      }
    }
  } catch (outerError) {
    // 최상위 에러 처리 - 모든 예외를 잡음
    console.error('❌ 로그인 처리 중 예상치 못한 오류:', outerError);
    if (!res.headersSent) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
  }
});

/** 비밀번호 찾기 - 이메일로 임시 비밀번호 발송 */
app.post('/api/forgot-password/email', async (req, res) => {
  console.log('=== 비밀번호 찾기 (이메일) 요청 ===');
  console.log('요청 본문:', req.body);
  
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: '이메일이 필요합니다.' });
  }
  
  // 🔒 실제로는 DB에서 사용자 확인 후 이메일 발송
  // 여기선 테스트용으로 간단 처리
  const VALID_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
  
  if (email !== VALID_EMAIL) {
    return res.status(404).json({ message: '가입되지 않은 이메일 주소입니다.' });
  }
  
  // 임시 비밀번호 생성 (실제로는 더 안전한 방식 사용)
  const tempPassword = 'temp' + Math.random().toString(36).substr(2, 6);
  
  console.log(`✅ 임시 비밀번호 생성: ${tempPassword}`);
  console.log('📧 이메일 발송 시뮬레이션 (실제로는 이메일 서비스 사용)');
  
  // 실제로는 이메일 발송 로직 추가
  // await sendPasswordResetEmail(email, tempPassword);
  
  return res.json({ 
    ok: true, 
    message: '비밀번호 재설정 이메일을 발송했습니다.',
    tempPassword: tempPassword // 개발용 - 실제로는 이메일로만 전송
  });
});

/** 비밀번호 찾기 - SMS로 임시 비밀번호 발송 */
app.post('/api/forgot-password/sms', async (req, res) => {
  console.log('=== 비밀번호 찾기 (SMS) 요청 ===');
  console.log('요청 본문:', req.body);
  
  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({ message: '휴대폰 번호가 필요합니다.' });
  }
  
  // 🔒 실제로는 DB에서 사용자 확인 후 SMS 발송
  // 여기선 테스트용으로 간단 처리
  const VALID_PHONE = process.env.TEST_PHONE || '01012345678';
  
  if (phone !== VALID_PHONE) {
    return res.status(404).json({ message: '가입되지 않은 휴대폰 번호입니다.' });
  }
  
  // 임시 비밀번호 생성
  const tempPassword = 'temp' + Math.random().toString(36).substr(2, 6);
  
  console.log(`✅ 임시 비밀번호 생성: ${tempPassword}`);
  console.log('📱 SMS 발송 시뮬레이션 (실제로는 SMS 서비스 사용)');
  
  // 실제로는 SMS 발송 로직 추가
  // await sendPasswordResetSMS(phone, tempPassword);
  
  return res.json({ 
    ok: true, 
    message: '비밀번호 재설정 SMS를 발송했습니다.',
    tempPassword: tempPassword // 개발용 - 실제로는 SMS로만 전송
  });
});

/** 인증번호 검증 및 비밀번호 재설정 */
app.post('/api/forgot-password/verify', async (req, res) => {
  console.log('=== 인증번호 검증 요청 ===');
  console.log('요청 본문:', req.body);
  
  const { phone, code } = req.body;
  
  if (!phone || !code) {
    return res.status(400).json({ message: '휴대폰 번호와 인증번호가 필요합니다.' });
  }
  
  // 🔒 실제로는 DB에서 인증번호 확인
  // 여기선 테스트용으로 간단 처리
  const VALID_CODE = '123456'; // 개발용 고정 코드
  
  if (code !== VALID_CODE) {
    return res.status(400).json({ message: '잘못된 인증번호입니다.' });
  }
  
  // 임시 비밀번호 생성
  const tempPassword = 'temp' + Math.random().toString(36).substr(2, 6);
  
  console.log(`✅ 인증 성공, 임시 비밀번호 생성: ${tempPassword}`);
  
  return res.json({ 
    ok: true, 
    message: '인증이 완료되었습니다.',
    tempPassword: tempPassword
  });
});

/** 내 정보 */
app.get('/api/me', (req, res) => {
  // 실제로는 토큰/세션 확인 후 사용자 조회
  const has = !!req.cookies.token;
  if (!has) return res.status(401).json({ message: 'UNAUTHORIZED' });
  return res.json({ ok: true, user: { id: 1, email: process.env.TEST_EMAIL || 'test@example.com', name: 'Test User' } });
});

/** 분실물 등록 (파일 업로드 지원) */
app.post('/lost', upload.array('images', 5), async (req, res) => {
  console.log('=== 분실물 등록 요청 ===');
  console.log('요청 본문:', req.body);
  console.log('업로드된 파일:', req.files);
  
  const { item_type, description, location, author_id, author_email, author_name } = req.body;
  
  if (!item_type || !location) {
    return res.status(400).json({ message: '분실물 종류와 위치는 필수입니다.' });
  }
  
  try {
    // 업로드된 이미지 URL 생성
    const image_urls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    // 사용자 ID 처리 (문자열 또는 숫자 모두 지원)
    let userId = author_id;
    if (!userId) {
      // author_id가 없으면 email을 기반으로 사용자 찾기 시도
      userId = author_email || 'anonymous';
    }
    
    // 새로운 분실물 생성
    const newItem = {
      id: Date.now(),
      title: item_type.trim(), // 클라이언트 호환성을 위해 title 추가
      item_type: item_type.trim(),
      description: description?.trim() || '',
      location: location.trim(),
      image_urls: image_urls,
      author_id: userId,
      author_email: author_email || null,
      author_name: author_name || null,
      created_at: new Date().toISOString(),
      comments: []
    };
    
    // 데이터 저장소에 추가
    lostItems.push(newItem);
    
    console.log(`✅ 분실물 등록 성공: ${item_type} - ${location}`);
    console.log(`📊 현재 총 분실물 개수: ${lostItems.length}개`);
    console.log(`🖼️ 업로드된 이미지: ${image_urls.length}개`);
    
    return res.json({ 
      ok: true, 
      message: '분실물이 성공적으로 등록되었습니다.',
      item: newItem
    });
  } catch (error) {
    console.error('분실물 등록 실패:', error);
    return res.status(500).json({ message: '분실물 등록 중 오류가 발생했습니다.' });
  }
});

/** 분실물 목록 조회 */
app.get('/lost', async (req, res) => {
  console.log('=== 분실물 목록 조회 요청 ===');
  
  try {
    // 최신순으로 정렬 (최근 등록된 것이 먼저)
    const sortedItems = [...lostItems].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    console.log(`✅ 분실물 목록 조회 성공: ${sortedItems.length}개`);
    console.log('📋 등록된 분실물 목록:', sortedItems.map(item => `${item.item_type} - ${item.location}`));
    
    return res.json(sortedItems);
  } catch (error) {
    console.error('분실물 목록 조회 실패:', error);
    return res.status(500).json({ message: '분실물 목록 조회 중 오류가 발생했습니다.' });
  }
});

/** 특정 분실물 조회 */
app.get('/lost/:id', async (req, res) => {
  console.log('=== 분실물 상세 조회 요청 ===');
  console.log('분실물 ID:', req.params.id);
  
  try {
    const itemId = parseInt(req.params.id);
    const item = lostItems.find(item => item.id === itemId);
    
    if (!item) {
      console.log(`❌ 분실물을 찾을 수 없음: ID ${itemId}`);
      return res.status(404).json({ message: '분실물을 찾을 수 없습니다.' });
    }
    
    console.log(`✅ 분실물 상세 조회 성공: ${item.item_type}`);
    
    return res.json(item);
  } catch (error) {
    console.error('분실물 상세 조회 실패:', error);
    return res.status(500).json({ message: '분실물 상세 조회 중 오류가 발생했습니다.' });
  }
});

/** 분실물 수정 */
app.put('/lost/:id', async (req, res) => {
  console.log('=== 분실물 수정 요청 ===');
  console.log('분실물 ID:', req.params.id);
  console.log('수정 데이터:', req.body);
  
  try {
    const itemId = parseInt(req.params.id);
    const { item_type, description, location } = req.body;
    
    if (!item_type || !location) {
      return res.status(400).json({ message: '분실물 종류와 위치는 필수입니다.' });
    }
    
    const itemIndex = lostItems.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      console.log(`❌ 분실물을 찾을 수 없음: ID ${itemId}`);
      return res.status(404).json({ message: '분실물을 찾을 수 없습니다.' });
    }
    
    // 분실물 수정
    const updatedItem = {
      ...lostItems[itemIndex],
      item_type: item_type.trim(),
      title: item_type.trim(), // 클라이언트 호환성
      description: description?.trim() || '',
      location: location.trim(),
      updated_at: new Date().toISOString()
    };
    
    lostItems[itemIndex] = updatedItem;
    
    console.log(`✅ 분실물 수정 성공: ${item_type} - ${location}`);
    
    return res.json({ 
      ok: true, 
      message: '분실물이 성공적으로 수정되었습니다.',
      item: updatedItem
    });
  } catch (error) {
    console.error('분실물 수정 실패:', error);
    return res.status(500).json({ message: '분실물 수정 중 오류가 발생했습니다.' });
  }
});

/** 분실물 삭제 */
app.delete('/lost/:id', async (req, res) => {
  console.log('=== 분실물 삭제 요청 ===');
  console.log('분실물 ID:', req.params.id);
  
  try {
    const itemId = parseInt(req.params.id);
    const itemIndex = lostItems.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      console.log(`❌ 분실물을 찾을 수 없음: ID ${itemId}`);
      return res.status(404).json({ message: '분실물을 찾을 수 없습니다.' });
    }
    
    // 분실물 삭제
    const deletedItem = lostItems.splice(itemIndex, 1)[0];
    
    console.log(`✅ 분실물 삭제 성공: ${deletedItem.item_type} - ${deletedItem.location}`);
    console.log(`📊 현재 총 분실물 개수: ${lostItems.length}개`);
    
    return res.json({ 
      ok: true, 
      message: '분실물이 성공적으로 삭제되었습니다.',
      deletedItem: deletedItem
    });
  } catch (error) {
    console.error('분실물 삭제 실패:', error);
    return res.status(500).json({ message: '분실물 삭제 중 오류가 발생했습니다.' });
  }
});

/** 댓글 등록 */
app.post('/lost/:id/comments', async (req, res) => {
  console.log('=== 댓글 등록 요청 ===');
  console.log('요청 본문:', req.body);
  console.log('분실물 ID:', req.params.id);
  
  const itemId = parseInt(req.params.id);
  const { text } = req.body;
  
  if (!text || !text.trim()) {
    return res.status(400).json({ message: '댓글 내용이 필요합니다.' });
  }
  
  try {
    // 분실물 찾기
    const item = lostItems.find(item => item.id === itemId);
    if (!item) {
      return res.status(404).json({ message: '분실물을 찾을 수 없습니다.' });
    }
    
    // 댓글 생성
    const comment = {
      id: Date.now(),
      text: text.trim(),
      author_name: '익명',
      created_at: new Date().toISOString()
    };
    
    // 분실물에 댓글 추가
    if (!item.comments) {
      item.comments = [];
    }
    item.comments.push(comment);
    
    console.log(`✅ 댓글 등록 성공: ${text.trim()}`);
    console.log(`📊 분실물 ID ${itemId}의 댓글 개수: ${item.comments.length}개`);
    console.log('📢 분실물 주인에게 알림 전송 시뮬레이션');
    
    return res.json({ 
      ok: true, 
      message: '댓글이 등록되었습니다.',
      comment: comment
    });
  } catch (error) {
    console.error('댓글 등록 실패:', error);
    return res.status(500).json({ message: '댓글 등록 중 오류가 발생했습니다.' });
  }
});

/** 댓글 등록 (기존 경로 호환성) */
app.post('/api/items/:id/comments', async (req, res) => {
  // 기존 경로로도 접근 가능하도록 동일한 로직 사용
  const itemId = parseInt(req.params.id);
  const { text } = req.body;
  
  if (!text || !text.trim()) {
    return res.status(400).json({ message: '댓글 내용이 필요합니다.' });
  }
  
  try {
    const item = lostItems.find(item => item.id === itemId);
    if (!item) {
      return res.status(404).json({ message: '분실물을 찾을 수 없습니다.' });
    }
    
    const comment = {
      id: Date.now(),
      text: text.trim(),
      author_name: '익명',
      created_at: new Date().toISOString()
    };
    
    if (!item.comments) {
      item.comments = [];
    }
    item.comments.push(comment);
    
    return res.json({ 
      ok: true, 
      message: '댓글이 등록되었습니다.',
      comment: comment
    });
  } catch (error) {
    console.error('댓글 등록 실패:', error);
    return res.status(500).json({ message: '댓글 등록 중 오류가 발생했습니다.' });
  }
});

// ==================== 게임 API ====================

/** 사용자 프로필 조회 */
app.get('/api/game/profile/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const profile = await getUserProfile(userId);
    return res.json({ ok: true, profile });
  } catch (error) {
    console.error('프로필 조회 실패:', error);
    return res.status(500).json({ ok: false, message: '프로필 조회 실패' });
  }
});

/** 한글 맞춤법 퍼즐 가져오기 */
app.get('/api/game/korean/:puzzleId?', async (req, res) => {
  try {
    const puzzleId = req.params.puzzleId ? parseInt(req.params.puzzleId) : null;
    const puzzle = await getKoreanPuzzle(puzzleId);
    if (!puzzle) {
      return res.status(404).json({ ok: false, message: '퍼즐을 찾을 수 없습니다.' });
    }
    return res.json({ ok: true, puzzle });
  } catch (error) {
    console.error('한글 퍼즐 조회 실패:', error);
    return res.status(500).json({ ok: false, message: '퍼즐 조회 실패' });
  }
});

/** 영어 단어 순서 퍼즐 가져오기 */
app.get('/api/game/english/:puzzleId?', async (req, res) => {
  try {
    const puzzleId = req.params.puzzleId ? parseInt(req.params.puzzleId) : null;
    const puzzle = await getEnglishPuzzle(puzzleId);
    if (!puzzle) {
      return res.status(404).json({ ok: false, message: '퍼즐을 찾을 수 없습니다.' });
    }
    return res.json({ ok: true, puzzle });
  } catch (error) {
    console.error('영어 퍼즐 조회 실패:', error);
    return res.status(500).json({ ok: false, message: '퍼즐 조회 실패' });
  }
});

/** 정답 제출 및 점수 저장 */
app.post('/api/game/submit', async (req, res) => {
  try {
    const { userId, puzzleType, puzzleId, answer, correct } = req.body;
    
    if (!userId || !puzzleType || !puzzleId || answer === undefined) {
      return res.status(400).json({ ok: false, message: '필수 파라미터가 없습니다.' });
    }
    
    const score = correct ? 100 : 0;
    const result = await saveProgress(userId, puzzleType, puzzleId, correct, score);
    
    // 정답이면 코인 보상
    if (correct) {
      await addCoins(userId, 10);
      const profile = await getUserProfile(userId);
      return res.json({ 
        ok: true, 
        correct: true,
        coinsEarned: 10,
        profile
      });
    }
    
    return res.json({ ok: true, correct: false });
  } catch (error) {
    console.error('정답 제출 실패:', error);
    return res.status(500).json({ ok: false, message: '정답 제출 실패' });
  }
});

/** 힌트 사용 */
app.post('/api/game/hint', async (req, res) => {
  try {
    const { userId, puzzleType, puzzleId, hintCost = 50 } = req.body;
    
    if (!userId || !puzzleType || !puzzleId) {
      return res.status(400).json({ ok: false, message: '필수 파라미터가 없습니다.' });
    }
    
    const profile = await useCoins(userId, hintCost);
    await recordHintUsage(userId, puzzleType, puzzleId, hintCost);
    
    return res.json({ ok: true, profile });
  } catch (error) {
    console.error('힌트 사용 실패:', error);
    return res.status(500).json({ ok: false, message: error.message || '힌트 사용 실패' });
  }
});

/** 코인 구매 */
app.post('/api/game/purchase/coins', async (req, res) => {
  try {
    const { userId, coinAmount, amount } = req.body;
    
    if (!userId || !coinAmount || !amount) {
      return res.status(400).json({ ok: false, message: '필수 파라미터가 없습니다.' });
    }
    
    const profile = await purchaseCoins(userId, coinAmount, amount);
    return res.json({ ok: true, profile });
  } catch (error) {
    console.error('코인 구매 실패:', error);
    return res.status(500).json({ ok: false, message: '코인 구매 실패' });
  }
});

/** 광고 제거 구매 */
app.post('/api/game/purchase/ad-removal', async (req, res) => {
  try {
    const { userId, amount = 5900 } = req.body;
    
    if (!userId) {
      return res.status(400).json({ ok: false, message: '사용자 ID가 필요합니다.' });
    }
    
    const profile = await purchaseAdRemoval(userId, amount);
    return res.json({ ok: true, profile });
  } catch (error) {
    console.error('광고 제거 구매 실패:', error);
    return res.status(500).json({ ok: false, message: '광고 제거 구매 실패' });
  }
});

/** 주소를 좌표로 변환하는 API (카카오맵 프록시) */
app.get('/api/geocode', async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address || !address.trim()) {
      return res.status(400).json({ ok: false, message: '주소가 필요합니다.' });
    }

    const apiKey = process.env.KAKAO_MAP_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, message: '카카오맵 API 키가 설정되지 않았습니다. .env 파일에 KAKAO_MAP_API_KEY를 설정해주세요.' });
    }
    
    // 한글 주소 검색을 위해 키워드 검색을 먼저 시도 (장소명 검색에 유리)
    try {
      const keywordResponse = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(address.trim())}`,
        {
          headers: {
            'Authorization': `KakaoAK ${apiKey}`,
          },
        }
      );

      const keywordData = await keywordResponse.json();
      
      if (keywordData.documents && keywordData.documents.length > 0) {
        // 검색어와 정확히 일치하는 결과를 우선 찾기
        const searchTerm = address.trim().toLowerCase();
        let bestMatch = keywordData.documents[0];
        
        // 검색어가 장소명과 정확히 일치하는 결과 찾기
        for (const doc of keywordData.documents) {
          const placeName = (doc.place_name || '').toLowerCase();
          if (placeName === searchTerm || placeName.includes(searchTerm)) {
            bestMatch = doc;
            break; // 정확히 일치하면 바로 사용
          }
        }
        
        const { x, y } = bestMatch;
        console.log(`✅ 키워드 검색 성공: ${address} -> ${bestMatch.place_name} (${y}, ${x})`);
        return res.json({ 
          ok: true, 
          coords: { lat: parseFloat(y), lng: parseFloat(x) },
          place_name: bestMatch.place_name,
          address_name: bestMatch.address_name
        });
      }
    } catch (keywordError) {
      console.log('키워드 검색 실패, 주소 검색 시도:', keywordError.message);
    }

    // 키워드 검색 실패 시 주소 검색 API 시도
    try {
      const addressResponse = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address.trim())}`,
        {
          headers: {
            'Authorization': `KakaoAK ${apiKey}`,
          },
        }
      );

      const addressData = await addressResponse.json();
      
      if (addressData.documents && addressData.documents.length > 0) {
        // 카카오맵 API가 반환하는 첫 번째 결과 사용 (이미 관련성 순으로 정렬됨)
        const { x, y } = addressData.documents[0];
        console.log(`✅ 주소 검색 성공: ${address} -> ${addressData.documents[0].address_name} (${y}, ${x})`);
        return res.json({ 
          ok: true, 
          coords: { lat: parseFloat(y), lng: parseFloat(x) },
          address_name: addressData.documents[0].address_name,
          road_address_name: addressData.documents[0].road_address_name
        });
      }
    } catch (addressError) {
      console.log('주소 검색 실패:', addressError.message);
    }

    return res.status(404).json({ ok: false, message: '주소를 찾을 수 없습니다.' });
  } catch (error) {
    console.error('좌표 변환 오류:', error);
    return res.status(500).json({ ok: false, message: '좌표 변환 중 오류가 발생했습니다.' });
  }
});

/** 성공 사례 목록 조회 */
app.get('/api/success-stories', async (req, res) => {
  console.log('=== 성공 사례 목록 조회 요청 ===');
  
  try {
    // 최신순으로 정렬
    const sortedStories = [...successStories].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    console.log(`✅ 성공 사례 목록 조회 성공: ${sortedStories.length}개`);
    
    return res.json(sortedStories);
  } catch (error) {
    console.error('성공 사례 목록 조회 실패:', error);
    return res.status(500).json({ message: '성공 사례 목록 조회 중 오류가 발생했습니다.' });
  }
});

/** 성공 사례 삭제 */
app.delete('/api/success-stories/:id', async (req, res) => {
  console.log('=== 성공 사례 삭제 요청 ===');
  console.log('성공 사례 ID:', req.params.id);
  
  try {
    const storyId = parseInt(req.params.id);
    const storyIndex = successStories.findIndex(story => story.id === storyId);
    
    if (storyIndex === -1) {
      console.log(`❌ 성공 사례를 찾을 수 없음: ID ${storyId}`);
      return res.status(404).json({ message: '성공 사례를 찾을 수 없습니다.' });
    }
    
    // 성공 사례 삭제
    const deletedStory = successStories.splice(storyIndex, 1)[0];
    
    console.log(`✅ 성공 사례 삭제 성공: ${deletedStory.title}`);
    console.log(`📊 현재 총 성공 사례 개수: ${successStories.length}개`);
    
    return res.json({ 
      ok: true, 
      message: '성공 사례가 성공적으로 삭제되었습니다.',
      deletedStory: deletedStory
    });
  } catch (error) {
    console.error('성공 사례 삭제 실패:', error);
    return res.status(500).json({ message: '성공 사례 삭제 중 오류가 발생했습니다.' });
  }
});

/** 성공 사례 등록 */
app.post('/api/success-stories', async (req, res) => {
  console.log('=== 성공 사례 등록 요청 ===');
  console.log('요청 본문:', req.body);
  
  const { title, content, category } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ message: '제목과 내용은 필수입니다.' });
  }
  
  try {
    const authorName = req.body.author_name || '익명';
    const authorId = req.body.author_id || 1; // 임시 사용자 ID
    
    const newStory = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      category: category?.trim() || null,
      author: authorName,
      author_id: authorId,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };
    
    successStories.push(newStory);
    
    console.log(`✅ 성공 사례 등록 성공: ${title}`);
    console.log(`📊 현재 총 성공 사례 개수: ${successStories.length}개`);
    
    return res.json({ 
      ok: true, 
      message: '성공 사례가 성공적으로 등록되었습니다.',
      story: newStory
    });
  } catch (error) {
    console.error('성공 사례 등록 실패:', error);
    return res.status(500).json({ message: '성공 사례 등록 중 오류가 발생했습니다.' });
  }
});

const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, HOST, () => {
  console.log(`🚀 API server listening on http://${HOST}:${PORT}`);
  if (NODE_ENV === 'development') {
    console.log(`📱 Local access: http://localhost:${PORT}`);
    console.log(`🌐 Network access: http://172.30.1.44:${PORT}`);
  }
  console.log(`🔒 Environment: ${NODE_ENV}`);
});
