// C:\LostFinderProject\server\server.js
/* eslint-disable no-console */
const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

// === DB 유틸 ===
const { 
  registerUser, 
  findUserByPhone, 
  findUserByEmail, 
  findUserByUsername, 
  findUserById,
  setTemporaryPassword,
  updatePassword,
  getAllUsers,
  createLostItem,
  updateLostItem,
  deleteLostItem,
  getAllLostItems,
  getLostItemById,
  createComment,
  deleteComment,
  getCommentsByItemId
} = require('./database');

// === SMS (Solapi/CoolSMS) ===
const coolsms = require('coolsms-node-sdk');
const coolsmsApiKey = process.env.SOLAPI_API_KEY;
const coolsmsApiSecret = process.env.SOLAPI_API_SECRET;
const coolsmsFrom = process.env.SOLAPI_SENDER;

let messageService = null;
if (coolsmsApiKey && coolsmsApiSecret) {
  try {
    coolsms.config.init({ apiKey: coolsmsApiKey, apiSecret: coolsmsApiSecret });
    messageService = coolsms.msg;
    console.log('✅ CoolSMS 초기화 완료');
    console.log(`📱 발신번호: ${coolsmsFrom || '(미설정)'}`);
  } catch (e) {
    console.log('⚠️ CoolSMS 초기화 실패:', e.message);
    messageService = null;
  }
} else {
  console.log('⚠️ CoolSMS 환경변수 미설정. 개발 모드로 진행합니다.');
}

// === 앱 기본 설정 ===
const app = express();
const FIXED_PORT = 5000;                    // 요청사항: 포트 5000 고정
const CLIENT_ORIGIN = 'http://localhost:3000'; // 요청사항: 클라 3000만 허용

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

// ==============================
// 이메일 발송기 설정
// ==============================
let emailTransporter = null;
function setupEmailTransporter() {
  const emailUser = process.env.EMAIL_USER || 'yoonjeongc@gmail.com';
  const emailPass = process.env.EMAIL_PASS || '';
  const emailService = process.env.EMAIL_SERVICE || 'gmail';

  if (!emailPass) {
    console.log('⚠️ EMAIL_PASS 미설정 → 이메일 발송 시뮬레이션 모드');
    return; // transporter 없이 시뮬레이션
  }

  let smtpConfig;
  if (process.env.EMAIL_HOST && process.env.EMAIL_PORT) {
    smtpConfig = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user: emailUser, pass: emailPass },
    };
    console.log(`📧 직접 SMTP 사용: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);
  } else {
    smtpConfig = { service: emailService, auth: { user: emailUser, pass: emailPass } };
    console.log(`📧 ${emailService} 서비스 사용`);
  }
  emailTransporter = nodemailer.createTransport(smtpConfig);
  console.log(`📧 이메일 발송 설정 완료 (from: ${emailUser})`);
}

// ==============================
// 유틸/상태
// ==============================
const apiRouter = express.Router();
const verificationCodes = {}; // { phone: { code, expiresAt } }
const requestHistory = {};    // rate limit
const resetTokens = {};       // { token: { userId, email, expiresAt } }
const authLogs = [];
const loginFailures = {};

function checkRateLimit(identifier, limit = 3, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  requestHistory[identifier] = (requestHistory[identifier] || []).filter(ts => ts > windowStart);
  if (requestHistory[identifier].length >= limit) return false;
  requestHistory[identifier].push(now);
  return true;
}
function logAuthEvent(type, identifier, success, details = '', metadata = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    type, identifier, success, details,
    ip: 'client-ip',
    alert: !!metadata.alert,
  };
  authLogs.push(entry);
  if (authLogs.length > 1000) authLogs.splice(0, authLogs.length - 1000);
  console.log(`📝 ${type} ${success ? '성공' : '실패'} — ${identifier} — ${details}${entry.alert ? ' [⚠️]' : ''}`);
}
function generateResetToken(len = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
function generateSecureTempPassword(len = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
function toKoreanPhone(phone) {
  return (phone || '').replace(/[^0-9]/g, '');
}
function maskEmail(email) {
  if (!email) return email;
  const [local, domain] = email.split('@');
  return local && local.length > 2 ? `${local.slice(0, 2)}***@${domain}` : email;
}
function maskPhoneNumber(phone) {
  if (!phone) return phone;
  if (phone.startsWith('+82')) return phone.replace(/(\+82\d{1,2})\d{3,4}(\d{4})/, '$1****$2');
  return phone.length >= 10 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : phone;
}

// ==============================
// 이메일 발송 함수
// ==============================
async function sendPasswordResetEmail(email, username, tempPassword) {
  if (!emailTransporter) setupEmailTransporter();
  try {
  if (!emailTransporter) {
      console.log('📧 [시뮬레이션] 비번 메일 →', email, username, tempPassword);
      return true;
    }
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '[LostFinder] 비밀번호 재설정',
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px;margin:0 auto;">
          <h2>🔑 LostFinder 비밀번호 재설정</h2>
          <p><b>${username}</b>님, 요청하신 임시 비밀번호입니다.</p>
          <div style="background:#f8f9fa;padding:16px;border-radius:8px;border:1px dashed #dc3545;">
            <p style="font-size:18px;margin:0;"><b>${tempPassword}</b></p>
          </div>
          <p style="color:#555">로그인 후 반드시 새 비밀번호로 변경해주세요.</p>
        </div>`
    });
    console.log(`✅ 이메일 발송 성공: ${email}`);
    return true;
  } catch (err) {
    console.log('⚠️ 이메일 발송 실패 → 시뮬레이션 처리:', err.message);
    console.log('📧', email, '🔑', tempPassword);
    return true;
  }
}
async function sendPasswordResetLinkEmail(email, username, resetLink) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️ 이메일 링크 발송: 개발모드 (미전송). 링크:', resetLink);
    return false;
  }
  if (!emailTransporter) setupEmailTransporter();
  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '[LostFinder] 비밀번호 재설정 링크',
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px;margin:0 auto;">
          <h2>🔗 비밀번호 재설정</h2>
          <p><b>${username}</b>님, 아래 버튼을 눌러 비밀번호를 재설정하세요.</p>
          <a href="${resetLink}" style="display:inline-block;background:#0d6efd;color:#fff;
             padding:12px 20px;border-radius:6px;text-decoration:none;">비밀번호 재설정하기</a>
          <p style="font-size:12px;color:#666;margin-top:8px;">링크가 열리지 않으면 주소창에 붙여넣으세요: ${resetLink}</p>
        </div>`
    });
    console.log(`✅ 재설정 링크 발송: ${email}`);
    return true;
  } catch (err) {
    console.error('❌ 이메일 링크 발송 실패:', err.message);
    return false;
  }
}

// ==============================
// 인증/계정 API
// ==============================
apiRouter.post('/register', async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;
    const normalizedPhone = toKoreanPhone(phone);
    if (!username || !email || !phone || !password) {
      return res.status(400).json({ success: false, error: '모든 필드를 입력해주세요.' });
    }
    const user = await registerUser({ username, email, phone: normalizedPhone, password });
    console.log(`✅ 회원가입: ${username} (${email})`);
    res.json({ success: true, message: '회원가입 완료', user: { id: user.id, username: user.username, email: user.email, phone: user.phone } });
  } catch (e) {
    console.error('❌ 회원가입 실패:', e.message);
    res.status(400).json({ success: false, error: e.message });
  }
});

apiRouter.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, error: '아이디/비밀번호를 입력해주세요.' });

    let user = null;
    try { user = await findUserByUsername(username); }
    catch { try { user = await findUserByEmail(username); } catch {/* noop */} }

    if (!user) {
      logAuthEvent('login', username, false, '미등록 사용자');
      return res.status(401).json({ success: false, error: '등록되지 않은 사용자명 또는 이메일입니다.' });
    }
    if (user.password !== password) {
      loginFailures[username] = loginFailures[username] || { count: 0, lastAttempt: Date.now() };
      loginFailures[username].count++;
      loginFailures[username].lastAttempt = Date.now();
      logAuthEvent('login', username, false, `비밀번호 불일치 (${loginFailures[username].count}회)`, { alert: loginFailures[username].count >= 5 });
      return res.status(401).json({ success: false, error: '비밀번호가 일치하지 않습니다.' });
    }
    if (loginFailures[username]) delete loginFailures[username];
    logAuthEvent('login', username, true, '로그인 성공');

    res.json({ success: true, message: '로그인되었습니다.', user: { id: user.id, username: user.username, email: user.email, phone: user.phone } });
  } catch (e) {
    console.error('❌ 로그인 오류:', e.message);
    res.status(500).json({ success: false, error: '로그인 중 오류가 발생했습니다.' });
  }
});

// 비번 찾기(전화 확인)
apiRouter.post('/forgot-password', async (req, res) => {
  try {
    const { phone } = req.body;
    const normalizedPhone = toKoreanPhone(phone);
    if (!phone) return res.status(400).json({ success: false, error: '전화번호를 입력해주세요.' });
    const user = await findUserByPhone(normalizedPhone);
    console.log(`✅ 비번찾기 요청: ${maskPhoneNumber(normalizedPhone)} (${user.username})`);
    res.json({ 
      success: true, 
      message: '등록된 번호입니다. 인증번호를 발송합니다.',
      user: { id: user.id, username: user.username, email: maskEmail(user.email), phone: maskPhoneNumber(normalizedPhone) }
    });
  } catch (e) {
    console.error('❌ 비번찾기 실패:', e.message);
    res.status(400).json({ success: false, error: e.message });
  }
});

// 임시 비밀번호를 SMS로 발송
apiRouter.post('/request-password-reset-sms', async (req, res) => {
  try {
    const { phone } = req.body;
    const normalizedPhone = toKoreanPhone(phone);
    if (!phone) return res.status(400).json({ success: false, error: '휴대폰 번호를 입력해주세요.' });

    if (!checkRateLimit(normalizedPhone, 3, 60000)) {
      return res.status(429).json({ success: false, error: '요청이 너무 많습니다. 잠시 후 다시 시도하세요.' });
    }

    const user = await findUserByPhone(normalizedPhone);
    if (!user) {
      logAuthEvent('reset_request', normalizedPhone, false, '미등록 번호');
      return res.status(404).json({ success: false, error: '등록된 휴대폰 번호가 아닙니다.' });
    }

    const tempPassword = generateSecureTempPassword();
    await setTemporaryPassword(user.id, tempPassword);
    
    const message = `[LostFinder] 비밀번호 재설정
    
임시 비밀번호: ${tempPassword}

⚠️ 로그인 후 반드시 새 비밀번호로 변경하세요.`;

    try {
      if (messageService && coolsmsFrom) {
        const result = await messageService.send({ messages: [{ to: normalizedPhone, from: coolsmsFrom, text: message }] });
        console.log(`✅ SMS 발송: ${maskPhoneNumber(normalizedPhone)}`, result.groupId || '');
      } else {
        console.log('⚠️ SMS 미설정 → 시뮬레이션 발송');
        console.log(`📱 ${maskPhoneNumber(normalizedPhone)} / 🔑 ${tempPassword}`);
      }
    } catch (smsErr) {
      console.log('⚠️ SMS 발송 실패(시뮬레이션 처리):', smsErr.message);
      console.log(`📱 ${maskPhoneNumber(normalizedPhone)} / 🔑 ${tempPassword}`);
    }
    
    logAuthEvent('reset_request', normalizedPhone, true, '임시 비밀번호 발송');
    res.json({ success: true, message: '임시 비밀번호가 SMS로 발송되었습니다. 로그인 후 변경해주세요.' });
  } catch (e) {
    console.error('❌ SMS 임시 비번 발송 실패:', e.message);
    logAuthEvent('reset_request', req.body.phone || 'unknown', false, e.message);
    res.status(500).json({ success: false, error: '비밀번호 재설정 요청 중 오류가 발생했습니다.', details: e.message });
  }
});

// SMS 이후 비번 재설정
apiRouter.post('/reset-password', async (req, res) => {
  try {
    const { phone, newPassword } = req.body;
    const normalizedPhone = toKoreanPhone(phone);
    if (!phone || !newPassword) return res.status(400).json({ success: false, error: '전화번호와 새 비밀번호가 필요합니다.' });
    if (newPassword.length < 6) return res.status(400).json({ success: false, error: '비밀번호는 최소 6자 이상.' });
    
    const user = await findUserByPhone(normalizedPhone);
    await updatePassword(user.id, newPassword);
    console.log(`✅ 비밀번호 재설정: ${maskPhoneNumber(normalizedPhone)} (${user.username})`);
    res.json({ success: true, message: '비밀번호가 재설정되었습니다.' });
  } catch (e) {
    console.error('❌ 비밀번호 재설정 실패:', e.message);
    res.status(400).json({ success: false, error: e.message });
  }
});

// 로그인 사용자 비번 변경
apiRouter.post('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !newPassword) return res.status(400).json({ success: false, error: '사용자 ID와 새 비밀번호 필요.' });

    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ success: false, error: '사용자를 찾을 수 없습니다.' });

    if (!user.isTemporaryPassword) {
      if (!currentPassword) return res.status(400).json({ success: false, error: '현재 비밀번호를 입력해주세요.' });
      if (user.password !== currentPassword) return res.status(400).json({ success: false, error: '현재 비밀번호가 올바르지 않습니다.' });
    }

    const result = await updatePassword(userId, newPassword);
    console.log(`✅ 비밀번호 변경: ${user.username} (${user.email})`);
    res.json({ success: true, message: result.message });
  } catch (e) {
    console.error('❌ 비번 변경 실패:', e.message);
    res.status(400).json({ success: false, error: e.message });
  }
});

// 단문 발송 API
apiRouter.post('/send-sms', async (req, res) => {
  try {
    if (!messageService || !coolsmsFrom) {
      return res.status(503).json({ success: false, error: 'SMS 발송 기능이 설정되지 않았습니다.(개발 모드)' });
    }
    const { phone, message } = req.body;
    const toPhone = toKoreanPhone(phone);
    if (!phone || !message) return res.status(400).json({ success: false, error: '휴대폰 번호와 메시지가 필요합니다.' });

    const result = await messageService.send({ messages: [{ to: toPhone, from: coolsmsFrom, text: message }] });
    console.log(`✅ SMS 발송: ${toPhone}`, result.groupId || '');
    res.json({ success: true, messageId: result.groupId, message: 'SMS가 성공적으로 발송되었습니다.' });
  } catch (e) {
    console.error('❌ SMS 발송 실패:', e);
    res.status(500).json({ success: false, error: 'SMS 발송 중 오류가 발생했습니다.', details: e.message });
  }
});

// 인증번호 발송/검증
apiRouter.post('/send-verification', async (req, res) => {
  try {
    const { phone, code: requestCode } = req.body;
    const normalizedPhone = toKoreanPhone(phone);
    if (!phone) return res.status(400).json({ success: false, error: '휴대폰 번호가 필요합니다.' });
    if (!checkRateLimit(normalizedPhone, 3, 60000)) return res.status(429).json({ success: false, error: '요청이 너무 많습니다. 잠시 후 재시도.' });

    const code = requestCode || Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes[normalizedPhone] = { code, expiresAt: Date.now() + 300000 };
    console.log(`🔐 [개발모드] 인증번호: ${code} (${normalizedPhone})`);

    try {
      if (messageService && coolsmsFrom) {
        const text = `[LostFinder] 인증번호: ${code}\n\n이 인증번호를 입력해주세요.`;
        await messageService.send({ messages: [{ to: normalizedPhone, from: coolsmsFrom, text }] });
        console.log(`✅ 인증번호 SMS 발송: ${normalizedPhone}`);
      }
    } catch (smsErr) {
      console.log('⚠️ 인증번호 SMS 실패(무시):', smsErr.message);
    }

    res.json({ success: true, messageId: 'dev-mode', message: `인증번호 6자리를 발송했습니다! (개발모드: 콘솔 확인)\n🔐 인증번호: ${code}` });
  } catch (e) {
    console.error('❌ 인증번호 발송 실패:', e);
    res.status(500).json({ success: false, error: '인증번호 발송 중 오류가 발생했습니다.', details: e.message });
  }
});
apiRouter.post('/verify-code', (req, res) => {
  const { phone, code } = req.body;
  const normalizedPhone = toKoreanPhone(phone);
  const entry = verificationCodes[normalizedPhone];
  if (!entry) return res.status(400).json({ success: false, error: '인증번호가 만료되었거나 존재하지 않습니다.' });
  if (Date.now() > entry.expiresAt) { delete verificationCodes[normalizedPhone]; return res.status(400).json({ success: false, error: '인증번호가 만료되었습니다.' }); }
  if (entry.code !== code) return res.status(400).json({ success: false, error: '인증번호가 올바르지 않습니다.' });
      delete verificationCodes[normalizedPhone];
  res.json({ success: true, message: '인증 성공!' });
});

// 이메일 방식 비번 재설정
apiRouter.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: '이메일을 입력해주세요.' });
    const user = await findUserByEmail(email);
    if (!user) { logAuthEvent('reset_request', email, false, '미등록 이메일'); return res.status(404).json({ success: false, error: '등록된 이메일이 아닙니다.' }); }
    const tempPassword = generateSecureTempPassword();
    await updatePassword(user.id, tempPassword);
    await sendPasswordResetEmail(email, user.username, tempPassword);
    logAuthEvent('reset_request', email, true, '임시 비밀번호 이메일 발송');
    res.json({ success: true, message: '비밀번호 재설정 이메일이 발송되었습니다.' });
  } catch (e) {
    console.error('❌ 비번 재설정(이메일) 실패:', e.message);
    res.status(500).json({ success: false, error: '비밀번호 재설정 요청 중 오류가 발생했습니다.', details: e.message });
  }
});
apiRouter.post('/request-password-reset-link', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: '이메일을 입력해주세요.' });
    const user = await findUserByEmail(email);
    if (!user) { logAuthEvent('reset_link_request', email, false, '미등록 이메일'); return res.status(404).json({ success: false, error: '등록된 이메일이 아닙니다.' }); }
    const token = generateResetToken();
    resetTokens[token] = { userId: user.id, email: user.email, expiresAt: Date.now() + 30 * 60 * 1000 };
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    await sendPasswordResetLinkEmail(email, user.username, resetLink);
    logAuthEvent('reset_link_request', email, true, '링크 발송');
    res.json({ success: true, message: '비밀번호 재설정 링크가 이메일로 발송되었습니다.' });
  } catch (e) {
    console.error('❌ 재설정 링크 요청 실패:', e.message);
    res.status(500).json({ success: false, error: '비밀번호 재설정 링크 요청 중 오류가 발생했습니다.', details: e.message });
  }
});
apiRouter.post('/validate-reset-token', (req, res) => {
    const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, error: '토큰이 필요합니다.' });
  const t = resetTokens[token];
  if (!t) return res.status(400).json({ success: false, error: '유효하지 않은 재설정 링크입니다.' });
  if (Date.now() > t.expiresAt) { delete resetTokens[token]; return res.status(400).json({ success: false, error: '재설정 링크가 만료되었습니다.' }); }
  res.json({ success: true, message: '유효한 토큰입니다.', email: t.email });
});
apiRouter.post('/reset-password-with-link', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ success: false, error: '토큰과 새 비밀번호가 필요합니다.' });
    const t = resetTokens[token];
    if (!t) return res.status(400).json({ success: false, error: '유효하지 않은 재설정 링크입니다.' });
    if (Date.now() > t.expiresAt) { delete resetTokens[token]; return res.status(400).json({ success: false, error: '재설정 링크가 만료되었습니다.' }); }
    await updatePassword(t.userId, newPassword);
      delete resetTokens[token];
    logAuthEvent('reset_link_complete', t.email, true, '비밀번호 재설정 완료');
    res.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (e) {
    console.error('❌ 링크 재설정 처리 실패:', e.message);
    res.status(500).json({ success: false, error: '비밀번호 재설정 중 오류가 발생했습니다.', details: e.message });
  }
});

// 상태/로그
apiRouter.get('/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    email: emailTransporter ? 'configured' : 'development_mode',
    sms: messageService ? 'configured' : 'development_mode'
  });
});
apiRouter.get('/users', async (_req, res) => {
  try { const users = await getAllUsers(); res.json({ success: true, users }); }
  catch (e) { console.error('❌ 사용자 조회 실패:', e.message); res.status(500).json({ success: false, error: e.message }); }
});
apiRouter.get('/auth-logs', (req, res) => {
    const { type, identifier, limit = 100 } = req.query;
  let logs = [...authLogs];
  if (type) logs = logs.filter(l => l.type === type);
  if (identifier) logs = logs.filter(l => l.identifier.includes(identifier));
  logs = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, parseInt(limit));
  const stats = { total: authLogs.length, success: authLogs.filter(l => l.success).length, failed: authLogs.filter(l => !l.success).length, byType: {} };
  authLogs.forEach(l => { stats.byType[l.type] = stats.byType[l.type] || { total: 0, success: 0, failed: 0 }; l.success ? stats.byType[l.type].success++ : stats.byType[l.type].failed++; });
  res.json({ success: true, logs, stats, totalLogs: authLogs.length });
});
apiRouter.get('/suspicious-activity', (_req, res) => {
  const now = Date.now(), hr = now - 3600000, day = now - 86400000;
  const recentFailures = authLogs.filter(l => l.type === 'login' && !l.success && new Date(l.timestamp).getTime() > hr);
  const dayFailures = authLogs.filter(l => l.type === 'login' && !l.success && new Date(l.timestamp).getTime() > day);
  const repeated = {};
  dayFailures.forEach(l => { repeated[l.identifier] = (repeated[l.identifier] || 0) + 1; });
  const suspiciousIdentifiers = Object.entries(repeated).filter(([, c]) => c >= 5).map(([identifier, c]) => ({ identifier, failureCount: c }));
  const resetAttempts = authLogs.filter(l => l.type.includes('reset') && new Date(l.timestamp).getTime() > day);
  res.json({ success: true, suspiciousActivity: { recentFailures: recentFailures.length, suspiciousIdentifiers, resetAttempts: resetAttempts.length, totalFailures: authLogs.filter(l => !l.success).length, lastHour: recentFailures.length, lastDay: authLogs.filter(l => new Date(l.timestamp).getTime() > day).length }, recentFailures: recentFailures.slice(0, 10) });
});

// ===== 분실물 CRUD =====
apiRouter.get('/lost-items', async (_req, res) => {
  try { const items = await getAllLostItems(); res.json({ success: true, items }); }
  catch (e) { console.error('❌ 분실물 목록 실패:', e.message); res.status(500).json({ success: false, error: e.message }); }
});
apiRouter.get('/lost-items/:id', async (req, res) => {
  try { const id = parseInt(req.params.id, 10); const item = await getLostItemById(id); const comments = await getCommentsByItemId(id); res.json({ success: true, item: { ...item, comments } }); }
  catch (e) { console.error('❌ 분실물 조회 실패:', e.message); res.status(500).json({ success: false, error: e.message }); }
});
apiRouter.post('/lost-items', async (req, res) => {
  try {
    const { author_id, item_type, description, location, image_urls } = req.body;
    if (!author_id || !item_type || !description || !location) return res.status(400).json({ success: false, error: '필수 필드가 누락되었습니다.' });
    const item = await createLostItem({ author_id, item_type, description, location, image_urls: image_urls || [] });
    console.log('✅ 분실물 등록:', item.id);
    res.status(201).json({ success: true, item });
  } catch (e) {
    console.error('❌ 분실물 등록 실패:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.put('/lost-items/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { item_type, description, location, image_urls } = req.body;
    if (!item_type || !description || !location) return res.status(400).json({ success: false, error: '필수 필드가 누락되었습니다.' });
    await updateLostItem(id, { item_type, description, location, image_urls: image_urls || [] });
    console.log('✅ 분실물 수정:', id);
    res.json({ success: true, message: '분실물이 성공적으로 수정되었습니다.' });
  } catch (e) {
    console.error('❌ 분실물 수정 실패:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.delete('/lost-items/:id', async (req, res) => {
  try { const id = parseInt(req.params.id, 10); await deleteLostItem(id); console.log('✅ 분실물 삭제:', id); res.json({ success: true, message: '분실물이 성공적으로 삭제되었습니다.' }); }
  catch (e) { console.error('❌ 분실물 삭제 실패:', e.message); res.status(500).json({ success: false, error: e.message }); }
});
apiRouter.post('/lost-items/:id/comments', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { author_id, text } = req.body;
    if (!author_id || !text) return res.status(400).json({ success: false, error: '필수 필드가 누락되었습니다.' });
    const comment = await createComment({ item_id: id, author_id, text });
    console.log('✅ 댓글 등록:', comment.id);
    res.status(201).json({ success: true, comment });
  } catch (e) {
    console.error('❌ 댓글 등록 실패:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});
apiRouter.delete('/comments/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { author_id } = req.body;
    if (!author_id) return res.status(400).json({ success: false, error: '작성자 정보가 필요합니다.' });
    await deleteComment(id, author_id);
    console.log('✅ 댓글 삭제:', id);
    res.json({ success: true, message: '댓글이 성공적으로 삭제되었습니다.' });
  } catch (e) {
    console.error('❌ 댓글 삭제 실패:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

// API 라우터 마운트
app.use('/api', apiRouter);

// 정적 파일(React build) — 필요 시 유지
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// ===== 루트 헬스체크(동시 기동 대기용) =====
app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

// 전역 에러 핸들러
app.use((err, _req, res, _next) => {
  console.error('서버 에러:', err);
  res.status(500).json({ success: false, error: err.message || '서버 내부 오류가 발생했습니다.' });
});

// ==============================
// 서버 시작 (고정 포트 5000, 자동 재시도/증분 금지)
// ==============================
const server = app.listen(FIXED_PORT, '0.0.0.0', () => {
  console.log(`🚀 서버 실행: http://localhost:${FIXED_PORT}`);
  console.log(`📡 API: http://localhost:${FIXED_PORT}/api`);
  console.log(`🏥 헬스: http://localhost:${FIXED_PORT}/health`);
}).on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`[server] 포트 ${FIXED_PORT}가 이미 사용 중입니다. 점유 프로세스를 종료한 뒤 다시 실행하세요.`);
  } else {
    console.error('❌ 서버 시작 실패:', err);
  }
  process.exit(1); // 자동 포트 변경 금지: 즉시 종료로 원인 명확화
});

const shutdown = () => {
  console.log('\n🛑 서버 종료 중...');
  server.close(() => process.exit(0));
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = app;
