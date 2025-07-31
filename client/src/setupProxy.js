const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true
      // pathRewrite: { '^/api': '' }, // 이 줄을 삭제 또는 주석 처리!
    })
  );
};