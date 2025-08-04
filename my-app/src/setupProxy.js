const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // This is the path the React app requests (e.g., /api/data, /api/chat)
    createProxyMiddleware({
      target: 'https://flask2.dickinson.edu:8032', // This is your Flask development server
      changeOrigin: true, // Needed for virtual hosted sites
      pathRewrite: {
        '^/api': '', // Rewrite path: remove '/api' from the request before forwarding to Flask
      },
      // Optional: Handle SSL certificate issues in development
      // If you get SSL errors from Node.js, you might need this:
      secure: false, // Set to false if your Flask dev server uses a self-signed or untrusted cert
      // Optional: Add custom headers for debugging or specific needs
      onProxyReq: function(proxyReq, req, res) {
        // console.log('Proxying request:', req.originalUrl, 'to ->', proxyReq.protocol + '//' + proxyReq.host + proxyReq.path);
      },
      onError: function(err, req, res) {
        console.error('Proxy error:', err);
      }
    })
  );
};

