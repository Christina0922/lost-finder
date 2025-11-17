// 클라이언트 설정 파일
const config = {
  development: {
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
    serverUrl: process.env.REACT_APP_SERVER_URL || 'http://localhost:5000',
    kakaoMapApiKey: process.env.REACT_APP_KAKAO_MAP_API_KEY || ''
  },
  production: {
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'https://your-domain.com/api',
    serverUrl: process.env.REACT_APP_SERVER_URL || 'https://your-domain.com',
    kakaoMapApiKey: process.env.REACT_APP_KAKAO_MAP_API_KEY || 'your-production-api-key'
  }
};

// 현재 환경 (개발/프로덕션)
const env = process.env.NODE_ENV || 'development';

export default config[env];
