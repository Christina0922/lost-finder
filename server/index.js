// C:\LostFinderProject\server\index.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import dotenv from 'dotenv';

// 환경변수 로드
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// 분실물 데이터 저장소 (실제로는 DB 사용)
let lostItems = [
  {
    id: 1,
    title: '지갑', // 클라이언트 호환성을 위해 title 추가
    item_type: '지갑',
    description: '검은색 가죽 지갑',
    location: '서울대학교 정문',
    image_urls: ['http://localhost:5000/uploads/wallet-sample.jpg'],
    author_id: 1,
    created_at: new Date().toISOString(),
    comments: []
  },
  {
    id: 2,
    title: '핸드폰', // 클라이언트 호환성을 위해 title 추가
    item_type: '핸드폰',
    description: '아이폰 14 프로',
    location: '강남역 2번 출구',
    image_urls: ['http://localhost:5000/uploads/phone-sample.jpg'],
    author_id: 1,
    created_at: new Date().toISOString(),
    comments: []
  }
];

/** ★★★ 핵심: 바디 파서 2종 반드시 활성화 ★★★ */
app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded
app.use(express.json());                           // application/json

/** CORS (프론트 localhost:5173과 쿠키 공유) */
app.use(cors({
  origin: 'http://localhost:5173',
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
  console.log('=== 로그인 요청 시작 ===');
  console.log('요청 URL:', req.url);
  console.log('요청 메서드:', req.method);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('요청 본문 (raw):', req.body);
  console.log('요청 본문 타입:', typeof req.body);
  
  const b = req.body || {};
  const email = b.email ?? b.user_email ?? b.username;
  const password = b.password ?? b.pw;
  
  console.log('파싱된 데이터:', { email, password });
  console.log('email 존재 여부:', !!email);
  console.log('password 존재 여부:', !!password);

  if (!email || !password) {
    console.log('❌ 이메일/비밀번호 누락');
    console.log('=== 로그인 요청 실패 ===');
    return res.status(400).json({ message: '이메일/비밀번호가 없습니다.' });
  }

  // 실제 데이터베이스에서 사용자 확인
  const { db } = await import('./db.js');
  
  db.get(
    `SELECT id, email, password, username FROM users WHERE email=?`,
    [email],
    (err, user) => {
      if (err) {
        console.log('❌ DB 오류:', err);
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
      }
      
      if (!user) {
        console.log('❌ 사용자를 찾을 수 없음:', email);
        return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      }
      
      if (user.password !== password) {
        console.log('❌ 비밀번호 불일치:', { email, provided: password, stored: user.password });
        return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      }
      
      // 성공: 세션/토큰 등 원하는 방식으로 발급
      const userData = { id: user.id, email: user.email, name: user.username };
      res.cookie('token', 'dummy', { httpOnly: true, sameSite: 'lax' });
      console.log('✅ 로그인 성공:', { email, userId: user.id });
      console.log('=== 로그인 요청 완료 ===');
      return res.json({ ok: true, user: userData });
    }
  );
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
  
  const { item_type, description, location } = req.body;
  
  if (!item_type || !location) {
    return res.status(400).json({ message: '분실물 종류와 위치는 필수입니다.' });
  }
  
  try {
    // 업로드된 이미지 URL 생성
    const image_urls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    // 새로운 분실물 생성
    const newItem = {
      id: Date.now(),
      title: item_type.trim(), // 클라이언트 호환성을 위해 title 추가
      item_type: item_type.trim(),
      description: description?.trim() || '',
      location: location.trim(),
      image_urls: image_urls,
      author_id: 1, // 임시 사용자 ID
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
app.post('/api/items/:id/comments', async (req, res) => {
  console.log('=== 댓글 등록 요청 ===');
  console.log('요청 본문:', req.body);
  
  const { id } = req.params;
  const { text } = req.body;
  
  if (!text || !text.trim()) {
    return res.status(400).json({ message: '댓글 내용이 필요합니다.' });
  }
  
  try {
    // 실제로는 DB에 댓글 저장
    const comment = {
      id: Date.now(),
      text: text.trim(),
      author_name: '익명',
      created_at: new Date().toISOString()
    };
    
    console.log(`✅ 댓글 등록 성공: ${text.trim()}`);
    console.log('📢 분실물 주인에게 알림 전송 시뮬레이션');
    
    // 실제로는 분실물 주인에게 알림 발송
    // await sendNotificationToOwner(itemId, comment);
    
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
