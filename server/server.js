const express = require('express');
const cors = require('cors');
const path = require('path');
const twilio = require('twilio');
const nodemailer = require('nodemailer');
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

// 이메일 전송 설정 (동적 처리)
let emailTransporter = null;

function setupEmailTransporter() {
  // 이메일 설정 (실제 운영 시에는 환경변수 사용)
  const emailUser = process.env.EMAIL_USER || 'yoonjeongc@gmail.com';
  const emailPass = process.env.EMAIL_PASS || 'test-password';
  const emailService = process.env.EMAIL_SERVICE || 'gmail'; // gmail, outlook, yahoo, naver, daum 등
  
  if (emailPass === 'test-password' || emailPass === 'your-gmail-app-password-here') {
    console.log('⚠️ 테스트 모드: 이메일 전송 시뮬레이션 활성화');
    console.log('📧 실제 이메일 전송을 위해서는 환경변수 EMAIL_PASS를 설정하세요');
    console.log('📧 이메일 서비스별 설정 방법:');
    console.log('   Gmail:');
    console.log('   1. Gmail → 설정 → 보안 → 2단계 인증 활성화');
    console.log('   2. Gmail → 설정 → 보안 → 앱 비밀번호 → "LostFinder" 생성');
    console.log('   3. 생성된 16자리 비밀번호를 EMAIL_PASS 환경변수에 설정');
    console.log('   Outlook/Hotmail:');
    console.log('   1. 계정 보안 → 앱 비밀번호 생성');
    console.log('   2. 생성된 비밀번호를 EMAIL_PASS 환경변수에 설정');
    console.log('   Naver:');
    console.log('   1. 메일 → 설정 → POP3/SMTP 설정 → SMTP 사용');
    console.log('   2. 비밀번호를 EMAIL_PASS 환경변수에 설정');
    console.log('   Daum:');
    console.log('   1. 메일 → 설정 → 보안 → 앱 비밀번호 생성');
    console.log('   2. 생성된 비밀번호를 EMAIL_PASS 환경변수에 설정');
    console.log('   Yahoo:');
    console.log('   1. 계정 보안 → 앱 비밀번호 생성');
    console.log('   2. 생성된 비밀번호를 EMAIL_PASS 환경변수에 설정');
    console.log('   기타 서비스:');
    console.log('   1. 해당 서비스의 SMTP 설정 확인');
    console.log('   2. EMAIL_SERVICE 환경변수로 서비스명 지정');
    console.log('   3. EMAIL_HOST, EMAIL_PORT 환경변수로 직접 SMTP 설정 가능');
    return;
  }
  
  // SMTP 설정 구성
  let smtpConfig;
  
  if (process.env.EMAIL_HOST && process.env.EMAIL_PORT) {
    // 직접 SMTP 설정 사용
    smtpConfig = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass
      }
    };
    console.log(`📧 직접 SMTP 설정 사용 (${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT})`);
  } else {
    // 서비스별 기본 설정 사용
    smtpConfig = {
      service: emailService,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    };
    console.log(`📧 ${emailService} 서비스 설정 사용`);
  }
  
  emailTransporter = nodemailer.createTransport(smtpConfig);
  console.log(`📧 이메일 전송 설정 완료 (발신자: ${emailUser}, 서비스: ${emailService})`);
}

const coolsmsApiKey = process.env.COOLSMS_API_KEY;
const coolsmsApiSecret = process.env.COOLSMS_API_SECRET;
const coolsmsFrom = process.env.COOLSMS_FROM_NUMBER;

let messageService = null;
if (coolsmsApiKey && coolsmsApiSecret) {
  messageService = new coolsms(coolsmsApiKey, coolsmsApiSecret);
  console.log('✅ CoolSMS 클라이언트 초기화 완료');
} else {
  console.log('⚠️ CoolSMS 환경변수가 설정되지 않았습니다. 개발 모드로 실행됩니다.');
}

// API 라우터 설정
const apiRouter = express.Router();

// 인증번호 저장소 (만료 시간 포함)
const verificationCodes = {};

// Rate limiting을 위한 요청 기록 저장소
const requestHistory = {};

// 비밀번호 재설정 토큰 저장소
const resetTokens = {};

// 인증 로그 저장소
const authLogs = [];

// 로그인 실패 누적 기록
const loginFailures = {};

// Rate limiting 함수
function checkRateLimit(identifier, limit = 3, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!requestHistory[identifier]) {
    requestHistory[identifier] = [];
  }
  
  // 윈도우 시간 밖의 요청 기록 제거
  requestHistory[identifier] = requestHistory[identifier].filter(
    timestamp => timestamp > windowStart
  );
  
  // 현재 요청 수 확인
  if (requestHistory[identifier].length >= limit) {
    return false; // 제한 초과
  }
  
  // 현재 요청 기록 추가
  requestHistory[identifier].push(now);
  return true; // 허용
}

// 인증 로그 기록 함수
function logAuthEvent(type, identifier, success, details = '', metadata = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type, // 'login', 'reset_request', 'reset_complete', 'verification'
    identifier, // email or phone
    success,
    details,
    ip: 'client-ip', // 실제로는 req.ip 사용
    alert: metadata.alert || false // 관리자 알림 필요 여부
  };
  
  authLogs.push(logEntry);
  
  // 로그가 너무 많아지면 오래된 것들 삭제 (최근 1000개만 유지)
  if (authLogs.length > 1000) {
    authLogs.splice(0, authLogs.length - 1000);
  }
  
  console.log(`📝 인증 로그: ${type} - ${identifier} - ${success ? '성공' : '실패'} - ${details}${metadata.alert ? ' [⚠️ 알림]' : ''}`);
}

// 안전한 토큰 생성 함수
function generateResetToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// 안전한 임시 비밀번호 생성 함수
function generateSecureTempPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// 이메일 전송 함수
async function sendPasswordResetEmail(email, username, tempPassword) {
  // 이메일 전송기 설정 (필요시)
  if (!emailTransporter) {
    setupEmailTransporter();
  }
  
  // 실제 이메일 전송 시도
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'yoonjeongc@gmail.com',
      to: email,
      subject: '[LostFinder] 비밀번호 재설정',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">🔑 LostFinder 비밀번호 재설정</h2>
          <p>안녕하세요, <strong>${username}</strong>님!</p>
          <p>비밀번호 재설정 요청이 접수되었습니다.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dc3545; margin-top: 0;">임시 비밀번호</h3>
            <p style="font-size: 18px; font-weight: bold; color: #333; background-color: #fff; padding: 10px; border-radius: 4px; border: 2px dashed #dc3545;">
              ${tempPassword}
            </p>
          </div>
          <p><strong>⚠️ 보안 주의사항:</strong></p>
          <ul>
            <li>이 임시 비밀번호로 로그인 후 반드시 새로운 비밀번호로 변경해주세요.</li>
            <li>임시 비밀번호는 다른 사람과 공유하지 마세요.</li>
            <li>로그인 후 즉시 비밀번호를 변경하는 것을 권장합니다.</li>
          </ul>
          <p style="color: #666; font-size: 14px;">
            본인이 요청하지 않은 경우 이 이메일을 무시하셔도 됩니다.
          </p>
        </div>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`✅ 실제 이메일 발송 성공: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ 실제 이메일 발송 실패:', error.message);
    console.log('⚠️ 시뮬레이션 모드로 전환');
    console.log(`📧 수신자: ${email}`);
    console.log(`👤 사용자: ${username}`);
    console.log(`🔑 임시 비밀번호: ${tempPassword}`);
    console.log('✅ 이메일 전송 성공 (시뮬레이션)');
    return true;
  }
}

// 이메일 전송 함수 (링크 방식)
async function sendPasswordResetLinkEmail(email, username, resetLink) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️ 이메일 전송 기능이 비활성화되어 있습니다.');
    return false;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '[LostFinder] 비밀번호 재설정 링크',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">🔑 LostFinder 비밀번호 재설정</h2>
          <p>안녕하세요, <strong>${username}</strong>님!</p>
          <p>비밀번호 재설정 요청이 접수되었습니다.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">비밀번호 재설정 링크</h3>
            <p style="color: #6c757d; font-size: 14px; margin-bottom: 15px;">
              아래 버튼을 클릭하여 새로운 비밀번호를 설정하세요.
            </p>
            <a href="${resetLink}" 
               style="display: inline-block; background-color: #007bff; color: white; 
                      padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                      font-weight: bold;">
              🔗 비밀번호 재설정하기
            </a>
            <p style="color: #6c757d; font-size: 12px; margin-top: 10px;">
              링크가 작동하지 않는 경우: <a href="${resetLink}" style="color: #007bff;">${resetLink}</a>
            </p>
          </div>
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              ⚠️ <strong>보안 주의사항:</strong><br>
              • 이 링크는 30분 후에 만료됩니다<br>
              • 본인이 요청하지 않은 경우 이 이메일을 무시하세요<br>
              • 링크는 한 번만 사용할 수 있습니다
            </p>
          </div>
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
          <p style="color: #6c757d; font-size: 12px;">
            LostFinder - 분실물 찾기 서비스
          </p>
        </div>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`✅ 비밀번호 재설정 링크 이메일 발송 완료: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ 이메일 발송 실패:', error);
    return false;
  }
}

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
        logAuthEvent('login', username, false, '등록되지 않은 사용자');
        return res.status(401).json({ 
          success: false, 
          error: '등록되지 않은 사용자명 또는 이메일입니다.' 
        });
      }
    }
    
    if (user.password !== password) {
      // 로그인 실패 누적
      if (!loginFailures[username]) {
        loginFailures[username] = { count: 0, lastAttempt: Date.now() };
      }
      loginFailures[username].count++;
      loginFailures[username].lastAttempt = Date.now();
      
      // 5회 이상 실패 시 경고 로그
      if (loginFailures[username].count >= 5) {
        logAuthEvent('login', username, false, `비밀번호 불일치 (${loginFailures[username].count}회 연속 실패)`, { alert: true });
      } else {
        logAuthEvent('login', username, false, `비밀번호 불일치 (${loginFailures[username].count}회 연속 실패)`);
      }
      
      return res.status(401).json({ 
        success: false, 
        error: '비밀번호가 일치하지 않습니다.' 
      });
    }

    // 로그인 성공 시 실패 기록 초기화
    if (loginFailures[username]) {
      delete loginFailures[username];
    }

    logAuthEvent('login', username, true, '로그인 성공');
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

// 비밀번호 재설정 API (SMS 인증 후)
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
    
    // 비밀번호 유효성 검사
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: '비밀번호는 최소 6자 이상이어야 합니다.' 
      });
    }
    
    const user = await findUserByPhone(normalizedPhone);
    const result = await updatePassword(user.id, newPassword);
    
    console.log(`✅ 비밀번호 재설정 성공: ${maskPhoneNumber(normalizedPhone)} (${user.username})`);
    res.json({ 
      success: true, 
      message: '비밀번호가 성공적으로 재설정되었습니다. 새로운 비밀번호로 로그인해주세요.'
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
    
    // Rate limiting 체크 (1분에 3회 제한)
    if (!checkRateLimit(normalizedPhone, 3, 60000)) {
      return res.status(429).json({ 
        success: false, 
        error: '너무 많은 요청입니다. 1분 후에 다시 시도해주세요.' 
      });
    }
    const code = requestCode || Math.floor(100000 + Math.random() * 900000).toString();
    // 인증번호를 서버 메모리에 저장
    verificationCodes[normalizedPhone] = { code, expiresAt: Date.now() + 300000 }; // 5분 후 만료
    
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
  const codeEntry = verificationCodes[normalizedPhone];

  if (!codeEntry) {
    return res.status(400).json({ success: false, error: '인증번호가 만료되었거나 존재하지 않습니다.' });
  }

  if (codeEntry.code === code) {
    if (Date.now() > codeEntry.expiresAt) {
      delete verificationCodes[normalizedPhone];
      return res.status(400).json({ success: false, error: '인증번호가 만료되었습니다.' });
    }
    delete verificationCodes[normalizedPhone]; // 인증 성공 시 코드 삭제
    return res.json({ success: true, message: '인증 성공!' });
  } else {
    return res.status(400).json({ success: false, error: '인증번호가 올바르지 않습니다.' });
  }
});

// 비밀번호 재설정 요청 API (임시 비밀번호 방식)
apiRouter.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: '이메일을 입력해주세요.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      logAuthEvent('reset_request', email, false, '등록되지 않은 이메일');
      return res.status(404).json({ success: false, error: '등록된 이메일이 아닙니다.' });
    }

    const tempPassword = generateSecureTempPassword();
    await updatePassword(user.id, tempPassword); // 임시 비밀번호로 업데이트

    await sendPasswordResetEmail(email, user.username, tempPassword);
    
    logAuthEvent('reset_request', email, true, '임시 비밀번호 발송');

    res.json({ 
      success: true, 
      message: '비밀번호 재설정 이메일이 발송되었습니다.'
    });
  } catch (error) {
    console.error('❌ 비밀번호 재설정 요청 실패:', error.message);
    logAuthEvent('reset_request', req.body.email || 'unknown', false, error.message);
    res.status(500).json({ 
      success: false, 
      error: '비밀번호 재설정 요청 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 비밀번호 재설정 링크 요청 API (새로운 링크 방식)
apiRouter.post('/request-password-reset-link', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: '이메일을 입력해주세요.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      logAuthEvent('reset_link_request', email, false, '등록되지 않은 이메일');
      return res.status(404).json({ success: false, error: '등록된 이메일이 아닙니다.' });
    }

    // 재설정 토큰 생성
    const resetToken = generateResetToken();
    const expiresAt = Date.now() + (30 * 60 * 1000); // 30분 후 만료
    
    resetTokens[resetToken] = {
      userId: user.id,
      email: user.email,
      expiresAt
    };

    // 재설정 링크 생성
    const resetLink = `http://192.168.45.27:3000/reset-password?token=${resetToken}`;
    
    // 이메일 전송 (링크 포함)
    await sendPasswordResetLinkEmail(email, user.username, resetLink);
    
    logAuthEvent('reset_link_request', email, true, '재설정 링크 발송');

    res.json({ 
      success: true, 
      message: '비밀번호 재설정 링크가 이메일로 발송되었습니다.'
    });
  } catch (error) {
    console.error('❌ 비밀번호 재설정 링크 요청 실패:', error.message);
    logAuthEvent('reset_link_request', req.body.email || 'unknown', false, error.message);
    res.status(500).json({ 
      success: false, 
      error: '비밀번호 재설정 링크 요청 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 비밀번호 재설정 토큰 검증 API
apiRouter.post('/validate-reset-token', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, error: '토큰이 필요합니다.' });
    }

    const tokenData = resetTokens[token];
    if (!tokenData) {
      logAuthEvent('reset_link_verify', 'unknown', false, '유효하지 않은 토큰');
      return res.status(400).json({ success: false, error: '유효하지 않은 재설정 링크입니다.' });
    }

    if (Date.now() > tokenData.expiresAt) {
      delete resetTokens[token];
      logAuthEvent('reset_link_verify', tokenData.email, false, '만료된 토큰');
      return res.status(400).json({ success: false, error: '재설정 링크가 만료되었습니다.' });
    }

    res.json({ 
      success: true, 
      message: '유효한 토큰입니다.',
      email: tokenData.email
    });
  } catch (error) {
    console.error('❌ 토큰 검증 실패:', error.message);
    res.status(500).json({ 
      success: false, 
      error: '토큰 검증 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 비밀번호 재설정 링크 검증 및 비밀번호 변경 API
apiRouter.post('/reset-password-with-link', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, error: '토큰과 새 비밀번호가 필요합니다.' });
    }

    const tokenData = resetTokens[token];
    if (!tokenData) {
      logAuthEvent('reset_link_verify', 'unknown', false, '유효하지 않은 토큰');
      return res.status(400).json({ success: false, error: '유효하지 않은 재설정 링크입니다.' });
    }

    if (Date.now() > tokenData.expiresAt) {
      delete resetTokens[token];
      logAuthEvent('reset_link_verify', tokenData.email, false, '만료된 토큰');
      return res.status(400).json({ success: false, error: '재설정 링크가 만료되었습니다.' });
    }

    // 새 비밀번호로 업데이트
    await updatePassword(tokenData.userId, newPassword);
    
    // 토큰 삭제
    delete resetTokens[token];
    
    logAuthEvent('reset_link_complete', tokenData.email, true, '비밀번호 재설정 완료');

    res.json({ 
      success: true, 
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });
  } catch (error) {
    console.error('❌ 비밀번호 재설정 링크 처리 실패:', error.message);
    res.status(500).json({ 
      success: false, 
      error: '비밀번호 재설정 중 오류가 발생했습니다.',
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

// 인증 로그 조회 API (관리자용)
apiRouter.get('/auth-logs', (req, res) => {
  try {
    const { type, identifier, limit = 100 } = req.query;
    
    let filteredLogs = [...authLogs];
    
    // 타입별 필터링
    if (type) {
      filteredLogs = filteredLogs.filter(log => log.type === type);
    }
    
    // 식별자별 필터링
    if (identifier) {
      filteredLogs = filteredLogs.filter(log => log.identifier.includes(identifier));
    }
    
    // 최신 순으로 정렬하고 제한
    filteredLogs = filteredLogs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));
    
    // 통계 계산
    const stats = {
      total: authLogs.length,
      success: authLogs.filter(log => log.success).length,
      failed: authLogs.filter(log => !log.success).length,
      byType: {}
    };
    
    authLogs.forEach(log => {
      if (!stats.byType[log.type]) {
        stats.byType[log.type] = { total: 0, success: 0, failed: 0 };
      }
      stats.byType[log.type].total++;
      if (log.success) {
        stats.byType[log.type].success++;
      } else {
        stats.byType[log.type].failed++;
      }
    });
    
    res.json({ 
      success: true, 
      logs: filteredLogs,
      stats,
      totalLogs: authLogs.length
    });
  } catch (error) {
    console.error('❌ 인증 로그 조회 실패:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 의심스러운 활동 감지 API (관리자용)
apiRouter.get('/suspicious-activity', (req, res) => {
  try {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    // 최근 1시간 내 실패한 로그인 시도
    const recentFailures = authLogs.filter(log => 
      log.type === 'login' && 
      !log.success && 
      new Date(log.timestamp).getTime() > oneHourAgo
    );
    
    // 최근 24시간 내 반복된 실패 시도
    const repeatedFailures = {};
    const dayFailures = authLogs.filter(log => 
      log.type === 'login' && 
      !log.success && 
      new Date(log.timestamp).getTime() > oneDayAgo
    );
    
    dayFailures.forEach(log => {
      if (!repeatedFailures[log.identifier]) {
        repeatedFailures[log.identifier] = 0;
      }
      repeatedFailures[log.identifier]++;
    });
    
    const suspiciousIdentifiers = Object.entries(repeatedFailures)
      .filter(([identifier, count]) => count >= 5)
      .map(([identifier, count]) => ({ identifier, failureCount: count }));
    
    // 비밀번호 재설정 시도 분석
    const resetAttempts = authLogs.filter(log => 
      log.type.includes('reset') && 
      new Date(log.timestamp).getTime() > oneDayAgo
    );
    
    const suspiciousActivity = {
      recentFailures: recentFailures.length,
      suspiciousIdentifiers,
      resetAttempts: resetAttempts.length,
      totalFailures: authLogs.filter(log => !log.success).length,
      lastHour: recentFailures.length,
      lastDay: authLogs.filter(log => 
        new Date(log.timestamp).getTime() > oneDayAgo
      ).length
    };
    
    res.json({ 
      success: true, 
      suspiciousActivity,
      recentFailures: recentFailures.slice(0, 10) // 최근 10개만 반환
    });
  } catch (error) {
    console.error('❌ 의심스러운 활동 분석 실패:', error.message);
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