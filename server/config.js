// 서버 설정 파일
const config = {
  development: {
    serverPort: 5000,
    clientOrigin: 'http://localhost:3000',
    apiBaseUrl: 'http://localhost:5000/api'
  },
  production: {
    serverPort: process.env.PORT || 5000,
    clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000/api'
  }
};

// 현재 환경 (개발/프로덕션)
const env = process.env.NODE_ENV || 'development';

module.exports = config[env];
