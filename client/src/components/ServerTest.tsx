import React, { useState } from 'react';
import { checkServerHealth, sendSMS, sendVerificationCode } from '../utils/api';

const ServerTest: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testServerHealth = async () => {
    setLoading(true);
    try {
      const result = await checkServerHealth();
      setStatus(`✅ 서버 연결 성공: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setStatus(`❌ 서버 연결 실패: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testSMS = async () => {
    if (!phone || !message) {
      setStatus('❌ 휴대폰 번호와 메시지를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const result = await sendSMS(phone, message);
      setStatus(`✅ SMS 발송 성공: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setStatus(`❌ SMS 발송 실패: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testVerification = async () => {
    if (!phone) {
      setStatus('❌ 휴대폰 번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const result = await sendVerificationCode(phone);
      setStatus(`✅ 인증번호 발송 성공: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setStatus(`❌ 인증번호 발송 실패: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>서버 연결 테스트</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testServerHealth} 
          disabled={loading}
          style={{ padding: '10px 20px', marginRight: '10px' }}
        >
          {loading ? '테스트 중...' : '서버 상태 확인'}
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="휴대폰 번호 (예: +821012345678)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <textarea
          placeholder="SMS 메시지"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', height: '80px' }}
        />
        <div>
          <button 
            onClick={testSMS} 
            disabled={loading}
            style={{ padding: '10px 20px', marginRight: '10px' }}
          >
            SMS 발송 테스트
          </button>
          <button 
            onClick={testVerification} 
            disabled={loading}
            style={{ padding: '10px 20px' }}
          >
            인증번호 발송 테스트
          </button>
        </div>
      </div>

      {status && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: status.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${status.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px',
          whiteSpace: 'pre-wrap'
        }}>
          {status}
        </div>
      )}
    </div>
  );
};

export default ServerTest; 