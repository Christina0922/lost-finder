const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const { 
  registerUser, 
  findUserByPhone, 
  findUserByEmail, 
  findUserByUsername, 
  updatePassword,
  getAllUsers 
} = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// API 라우터 설정
const apiRouter = express.Router();

// 사용자 등록 API
apiRouter.post('/register', async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;
    
    if (!username || !email || !phone || !password) {
      return res.status(400).json({ 
        success: false, 
        error: '모든 필드를 입력해주세요.' 
      });
    }

    const user = await registerUser({ username, email, phone, password });
    
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
        error: '사용자명과 비밀번호를 입력해주세요.' 
      });
    }

    const user = await findUserByUsername(username);
    
    if (user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        error: '비밀번호가 일치하지 않습니다.' 
      });
    }

    console.log(`✅ 로그인 성공: ${username}`);
    res.json({ 
      success: true, 
      message: '로그인이 완료되었습니다.',
      user: { id: user.id, username: user.username, email: user.email, phone: user.phone }
    });
  } catch (error) {
    console.error('❌ 로그인 실패:', error.message);
    res.status(401).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 비밀번호 찾기 - 전화번호 확인 API
apiRouter.post('/forgot-password', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        error: '전화번호를 입력해주세요.' 
      });
    }

    const user = await findUserByPhone(phone);
    
    console.log(`✅ 비밀번호 찾기 요청: ${maskPhoneNumber(phone)} (${user.username})`);
    res.json({ 
      success: true, 
      message: '등록된 전화번호입니다. 인증번호를 발송합니다.',
      user: { 
        id: user.id, 
        username: user.username, 
        email: maskEmail(user.email), 
        phone: maskPhoneNumber(user.phone) 
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
    
    if (!phone || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: '전화번호와 새 비밀번호를 입력해주세요.' 
      });
    }

    const user = await findUserByPhone(phone);
    const result = await updatePassword(user.id, newPassword);
    
    console.log(`✅ 비밀번호 재설정 성공: ${phone} (${user.username})`);
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

// SMS 발송 API
apiRouter.post('/send-sms', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ 
        success: false, 
        error: '휴대폰 번호와 메시지가 필요합니다.' 
      });
    }

    if (twilioClient) {
      // 실제 SMS 발송
      const result = await twilioClient.messages.create({
        body: message,
        from: fromNumber,
        to: phone
      });
      
      console.log(`✅ SMS 발송 성공: ${phone} - SID: ${result.sid}`);
      res.json({ 
        success: true, 
        messageId: result.sid,
        message: 'SMS가 성공적으로 발송되었습니다.'
      });
    } else {
      // 개발용 시뮬레이션
      console.log(`📱 [개발용 SMS 시뮬레이션]`);
      console.log(`📞 수신자: ${phone}`);
      console.log(`💬 메시지: ${message}`);
      
      res.json({ 
        success: true, 
        messageId: 'dev_' + Date.now(),
        message: '개발 모드: SMS 시뮬레이션 완료 (콘솔에서 확인)'
      });
    }
  } catch (error) {
    console.error('❌ SMS 발송 실패:', error);
    res.status(500).json({ 
      success: false, 
      error: 'SMS 발송 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 인증번호 발송 API
apiRouter.post('/send-verification', async (req, res) => {
  try {
    const { phone, code: requestCode } = req.body;
    
    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        error: '휴대폰 번호가 필요합니다.' 
      });
    }

    const code = requestCode || Math.floor(100000 + Math.random() * 900000).toString();
    const message = `[LostFinder] 인증번호: ${code}\n\n이 인증번호를 입력해주세요.`;

    if (twilioClient) {
      // 실제 SMS 발송
      const result = await twilioClient.messages.create({
        body: message,
        from: fromNumber,
        to: phone
      });
      
      console.log(`✅ 인증번호 발송 성공: ${phone} - 코드: ${code}`);
      res.json({ 
        success: true, 
        messageId: result.sid,
        message: '인증번호가 발송되었습니다.'
      });
    } else {
      // 개발용 시뮬레이션
      console.log(`📱 [개발용 인증번호 시뮬레이션]`);
      console.log(`📞 수신자: ${phone}`);
      console.log(`🔐 인증번호: ${code}`);
      
      res.json({ 
        success: true, 
        messageId: 'dev_' + Date.now(),
        message: '개발 모드: 인증번호 시뮬레이션 완료 (콘솔에서 확인)'
      });
    }
  } catch (error) {
    console.error('❌ 인증번호 발송 실패:', error);
    res.status(500).json({ 
      success: false, 
      error: '인증번호 발송 중 오류가 발생했습니다.',
      details: error.message
    });
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

module.exports = app;

// 서버 시작
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`📡 API 엔드포인트: http://localhost:${PORT}/api`);
    console.log(`🏥 상태 확인: http://localhost:${PORT}/api/health`);
  });
} 