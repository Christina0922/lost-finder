const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
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

// SMS 발송 API
app.post('/api/send-sms', async (req, res) => {
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
app.post('/api/send-verification', async (req, res) => {
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
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    twilio: twilioClient ? 'configured' : 'development_mode'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📱 SMS API: http://localhost:${PORT}/api/send-verification`);
  console.log(`🔧 상태 확인: http://localhost:${PORT}/api/health`);
}); 