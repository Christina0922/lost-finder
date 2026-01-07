import React from 'react';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface GoogleLoginButtonProps {
  onSuccess: (credential: string) => void;
  onError: () => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSuccess, onError }) => {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

  if (!clientId) {
    console.error('클라이언트 ID가 설정되지 않았습니다.');
    return (
      <div style={{ 
        padding: '16px', 
        backgroundColor: '#fee', 
        borderRadius: '8px',
        textAlign: 'center',
        color: '#c33'
      }}>
        로그인이 설정되지 않았습니다.
        <br />
        <small>.env 파일에 REACT_APP_GOOGLE_CLIENT_ID를 설정해주세요.</small>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
        <GoogleLogin
          onSuccess={(credentialResponse: CredentialResponse) => {
            if (credentialResponse.credential) {
              onSuccess(credentialResponse.credential);
            }
          }}
          onError={() => {
            console.error('로그인 실패');
            onError();
          }}
          useOneTap
          text="continue_with"
          shape="rectangular"
          theme="filled_blue"
          size="large"
          width="100%"
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;

