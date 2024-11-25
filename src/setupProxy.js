const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = app => {
  // HTTP 요청에 대한 프록시 설정
  app.use(
    '/proxy',
    createProxyMiddleware({
      target: 'http://localhost:3001', // WebSocket 서버 주소
      changeOrigin: true,
      ws: true, // WebSocket 연결을 프록시하도록 설정
    })
  );
  
};
