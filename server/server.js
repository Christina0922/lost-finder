const express = require('express');
const cors = require('cors');
const path = require('path');
const twilio = require('twilio');
const { 
  registerUser, 
  findUserByPhone, 
  findUserByEmail, 
  findUserByUsername, 
  findUserById,
  updatePassword,
  getAllUsers 
} = require('./database');
require('dotenv').config();
const coolsms = require('coolsms-node-sdk').default;

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json());

// Twilio 클라이언트 초기화
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;

let twilioClient = null;

if (accountSid && authToken && fromNumber) {
  twilioClient = twilio(accountSid, authToken);
  console.log('✅ Twilio 클라이언트 초기화 완료');
} else {
  console.log('⚠️ Twilio 환경변수가 설정되지 않았습니다. 개발 모드로 실행됩니다.');
}

const coolsmsApiKey = process.env.COOLSMS_API_KEY;
const coolsmsApiSecret = process.env.COOLSMS_API_SECRET;
const coolsmsFrom = process.env.COOLSMS_FROM_NUMBER;
const messageService = new coolsms(coolsmsApiKey, coolsmsApiSecret);

console.log('✅ CoolSMS 클라이언트 초기화 완료');

// API 라우터 설정
const apiRouter = express.Router();

const verificationCodes = {};

// 번호를 국제번호로 변환하는 함수 (010 -> 010, 010-xxxx-xxxx -> 010xxxxxxxx)
function toKoreanPhone(phone) {
  return phone.replace(/[^0-9]/g, '');
}

// 사용자 등록 API
apiRouter.post('/register', async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;
    const normalizedPhone = toKoreanPhone(phone);
    if (!username || !email || !phone || !password) {
      return res.status(400).json({ 
        success: false, 
        error: '모든 필드를 입력해주세요.' 
      });
    }
    const user = await registerUser({ username, email, phone: normalizedPhone, password });
    
    console.log(`✅ 사용자 등록 성공: ${username} (${email})`);
    res.json({ 
      success: true, 
      message: '회원가입이 완료되었습니다.',
      user: { id: user.id, username: user.username, email: user.email, phone: user.phone }
    });
  } catch (error) {
    console.error('❌ 사용자 등록 실패:', error.message);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 로그인 API
apiRouter.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: '사용자명/이메일과 비밀번호를 입력해주세요.' 
      });
    }

    // 사용자명 또는 이메일로 사용자 찾기
    let user = null;
    try {
      user = await findUserByUsername(username);
    } catch (error) {
      try {
        user = await findUserByEmail(username);
      } catch (emailError) {
        return res.status(401).json({ 
          success: false, 
          error: '등록되지 않은 사용자명 또는 이메일입니다.' 
        });
      }
    }
    
    if (user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        error: '비밀번호가 일치하지 않습니다.' 
      });
    }

    console.log(`✅ 로그인 성공: ${user.username} (${user.email})`);
    res.json({ 
      success: true, 
      message: '로그인되었습니다.',
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        phone: user.phone 
      }
    });
  } catch (error) {
    console.error('❌ 로그인 실패:', error.message);
    res.status(500).json({ 
      success: false, 
      error: '로그인 중 오류가 발생했습니다.' 
    });
  }
});

// 비밀번호 찾기 - 전화번호 확인 API
apiRouter.post('/forgot-password', async (req, res) => {
  try {
    const { phone } = req.body;
    const normalizedPhone = toKoreanPhone(phone);
    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        error: '전화번호를 입력해주세요.' 
      });
    }
    const user = await findUserByPhone(normalizedPhone);
    
    console.log(`✅ 비밀번호 찾기 요청: ${maskPhoneNumber(normalizedPhone)} (${user.username})`);
    res.json({ 
      success: true, 
      message: '등록된 전화번호입니다. 인증번호를 발송합니다.',
      user: { 
        id: user.id, 
        username: user.username, 
        email: maskEmail(user.email), 
        phone: maskPhoneNumber(normalizedPhone) 
      }
    });
  } catch (error) {
    console.error('❌ 비밀번호 찾기 실패:', error.message);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 이메일 마스킹 함수
function maskEmail(email) {
  if (!email) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) return email;
  return `${local.substring(0, 2)}***@${domain}`;
}

// 핸드폰 번호 마스킹 함수
function maskPhoneNumber(phone) {
  if (!phone) return phone;
  
  // +82로 시작하는 경우 (한국 번호)
  if (phone.startsWith('+82')) {
    return phone.replace(/(\+82\d{1,2})\d{3,4}(\d{4})/, '$1****$2');
  }
  
  // 일반적인 전화번호 형식
  if (phone.length >= 10) {
    const start = phone.substring(0, 3);
    const end = phone.substring(phone.length - 4);
    return `${start}****${end}`;
  }
  
  // 짧은 번호는 그대로 반환
  return phone;
}

// 비밀번호 재설정 API
apiRouter.post('/reset-password', async (req, res) => {
  try {
    const { phone, newPassword } = req.body;
    const normalizedPhone = toKoreanPhone(phone);
    if (!phone || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: '전화번호와 새 비밀번호를 입력해주세요.' 
      });
    }
    const user = await findUserByPhone(normalizedPhone);
    const result = await updatePassword(user.id, newPassword);
    
    console.log(`✅ 비밀번호 재설정 성공: ${normalizedPhone} (${user.username})`);
    res.json({ 
      success: true, 
      message: result.message
    });
  } catch (error) {
    console.error('❌ 비밀번호 재설정 실패:', error.message);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 비밀번호 변경 API (로그인된 사용자용)
apiRouter.post('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: '모든 필드를 입력해주세요.' 
      });
    }

    // 현재 사용자 정보 조회
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: '사용자를 찾을 수 없습니다.' 
      });
    }

    // 현재 비밀번호 확인
    if (user.password !== currentPassword) {
      return res.status(400).json({ 
        success: false, 
        error: '현재 비밀번호가 올바르지 않습니다.' 
      });
    }

    // 새 비밀번호로 업데이트
    const result = await updatePassword(userId, newPassword);
    
    console.log(`✅ 비밀번호 변경 성공: ${user.username} (${user.email})`);
    res.json({ 
      success: true, 
      message: result.message
    });
  } catch (error) {
    console.error('❌ 비밀번호 변경 실패:', error.message);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// SMS 발송 API (CoolSMS)
apiRouter.post('/send-sms', async (req, res) => {
  try {
    const { phone, message } = req.body;
    const toPhone = toKoreanPhone(phone);
    if (!phone || !message) {
      return res.status(400).json({ 
        success: false, 
        error: '휴대폰 번호와 메시지가 필요합니다.' 
      });
    }
    const result = await messageService.sendOne({
      to: toPhone,
      from: coolsmsFrom,
      text: message
    });
    console.log(`✅ SMS 발송 성공: ${toPhone} - groupId: ${result.groupId}`);
    res.json({ 
      success: true, 
      messageId: result.groupId,
      message: 'SMS가 성공적으로 발송되었습니다.'
    });
  } catch (error) {
    console.error('❌ SMS 발송 실패:', error);
    res.status(500).json({ 
      success: false, 
      error: 'SMS 발송 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 인증번호 발송 API (CoolSMS)
apiRouter.post('/send-verification', async (req, res) => {
  try {
    const { phone, code: requestCode } = req.body;
    const normalizedPhone = toKoreanPhone(phone);
    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        error: '휴대폰 번호가 필요합니다.' 
      });
    }
    const code = requestCode || Math.floor(100000 + Math.random() * 900000).toString();
    // 인증번호를 서버 메모리에 저장
    verificationCodes[normalizedPhone] = code;
    
    // 개발 모드에서는 콘솔에 인증번호 출력
    console.log(`🔐 [개발모드] 인증번호: ${code} (${normalizedPhone})`);
    console.log(`📱 실제 SMS 대신 콘솔에서 인증번호를 확인하세요!`);
    
    // 실제 SMS 발송 시도 (실패해도 성공으로 처리)
    try {
      const message = `[LostFinder] 인증번호: ${code}\n\n이 인증번호를 입력해주세요.`;
      const result = await messageService.sendOne({
        to: normalizedPhone,
        from: coolsmsFrom,
        text: message
      });
      console.log(`✅ 실제 SMS 발송 성공: ${normalizedPhone} - 코드: ${code}`);
    } catch (smsError) {
      console.log(`⚠️ SMS 발송 실패 (개발모드): ${smsError.message}`);
    }
    
    res.json({ 
      success: true, 
      messageId: 'dev-mode',
      message: `인증번호 6자리를 발송했습니다!\n\n📱 개발모드에서는 콘솔에서 인증번호를 확인하세요.\n🔐 인증번호: ${code}`
    });
  } catch (error) {
    console.error('❌ 인증번호 발송 실패:', error);
    res.status(500).json({ 
      success: false, 
      error: '인증번호 발송 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 인증번호 검증 API
apiRouter.post('/verify-code', (req, res) => {
  const { phone, code } = req.body;
  const normalizedPhone = toKoreanPhone(phone);
  console.log('인증번호 검증 요청:', normalizedPhone, '입력 코드:', code, '저장 코드:', verificationCodes[normalizedPhone]);
  if (verificationCodes[normalizedPhone] === code) {
    delete verificationCodes[normalizedPhone]; // 인증 성공 시 코드 삭제
    return res.json({ success: true, message: '인증 성공!' });
  } else {
    return res.status(400).json({ success: false, error: '인증번호가 올바르지 않습니다.' });
  }
});

// 서버 상태 확인
apiRouter.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    twilio: twilioClient ? 'configured' : 'development_mode'
  });
});

// 사용자 목록 조회 API (개발용)
apiRouter.get('/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ 
      success: true, 
      users 
    });
  } catch (error) {
    console.error('❌ 사용자 목록 조회 실패:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// API 라우터를 /api 경로에 마운트
app.use('/api', apiRouter);

// 정적 파일 서빙 (React 빌드 파일)
app.use(express.static(path.join(__dirname, '../client/build')));

// 모든 GET 요청을 React 앱으로 라우팅 (SPA 지원)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// 전역 에러 핸들러 (모든 에러를 JSON으로 반환)
app.use((err, req, res, next) => {
  console.error('서버 에러:', err);
  res.status(500).json({
    success: false,
    error: err.message || '서버 내부 오류가 발생했습니다.'
  });
});

module.exports = app;

// 서버 시작
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`📡 API 엔드포인트: http://localhost:${PORT}/api`);
    console.log(`🌐 외부 접속: http://192.168.45.27:${PORT}`);
    console.log(`🏥 상태 확인: http://localhost:${PORT}/api/health`);
  });
} 