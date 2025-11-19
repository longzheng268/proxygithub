// server.js - Node.js HTTP 服务器适配器
// 将 Cloudflare Worker 适配为标准 Node.js HTTP 服务器

const http = require('http');
const { Readable } = require('stream');

// 导入 worker (需要先转换为 CommonJS 或使用动态导入)
// 由于 worker.js 使用 ES6 模块，这里提供两种方案

const PORT = process.env.PORT || 8787;
const HOST = process.env.HOST || '0.0.0.0';

// 方案 1: 使用动态导入 (Node.js 14+)
async function startServer() {
  const workerModule = await import('./worker.js');
  const worker = workerModule.default;

  const server = http.createServer(async (req, res) => {
    try {
      // 构造完整 URL
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const host = req.headers.host || `${HOST}:${PORT}`;
      const url = `${protocol}://${host}${req.url}`;

      // 构造 Headers
      const headers = new Headers();
      Object.entries(req.headers).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => headers.append(key, v));
        } else {
          headers.set(key, value);
        }
      });

      // 读取请求体
      let body = null;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        body = await new Promise((resolve, reject) => {
          const chunks = [];
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', () => resolve(Buffer.concat(chunks)));
          req.on('error', reject);
        });
      }

      // 构造 Request 对象
      const request = new Request(url, {
        method: req.method,
        headers: headers,
        body: body && body.length > 0 ? body : null
      });

      // 调用 worker 的 fetch 方法
      const env = {
        URL302: process.env.URL302 || '',
        URL: process.env.URL || '',
        UA: process.env.UA || '',
        // 地理位置限制配置
        GEO_RESTRICTION_ENABLED: process.env.GEO_RESTRICTION_ENABLED || 'true',
        GEO_RESTRICTION_MODE: process.env.GEO_RESTRICTION_MODE || 'whitelist',
        ALLOWED_COUNTRIES: process.env.ALLOWED_COUNTRIES || 'CN',
        BLOCKED_COUNTRIES: process.env.BLOCKED_COUNTRIES || '',
        // 速率限制配置
        RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED || 'false',
        RATE_LIMIT_PER_MINUTE: process.env.RATE_LIMIT_PER_MINUTE || '60'
      };
      
      const response = await worker.fetch(request, env, {});

      // 设置响应状态码
      res.statusCode = response.status;
      res.statusMessage = response.statusText;

      // 设置响应头
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      // 发送响应体
      if (response.body) {
        const reader = response.body.getReader();
        const stream = new Readable({
          async read() {
            const { done, value } = await reader.read();
            if (done) {
              this.push(null);
            } else {
              this.push(Buffer.from(value));
            }
          }
        });
        stream.pipe(res);
      } else {
        res.end();
      }

    } catch (error) {
      console.error('Server error:', error);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end(`Internal Server Error: ${error.message}`);
      }
    }
  });

  server.listen(PORT, HOST, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🚀 ProxyGitHub Server is running!                        ║
║                                                           ║
║  📡 Local:    http://${HOST}:${PORT}${' '.repeat(Math.max(0, 26 - HOST.length - PORT.toString().length))}║
║  🌐 Network:  http://<your-ip>:${PORT}${' '.repeat(Math.max(0, 23 - PORT.toString().length))}║
║                                                           ║
║  📖 GitHub:   https://github.com/longzheng268/proxygithub ║
║  📚 Docs:     See README.md for usage                     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
    console.log('Press Ctrl+C to stop\n');
  });

  // 优雅关闭
  process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT signal received: closing HTTP server');
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  });
}

// 启动服务器
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
