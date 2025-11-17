# 🖥️ 服务器部署指南 / Server Deployment Guide

本指南提供在普通服务器上部署的完整步骤，支持 Node.js 直接部署和 Docker 容器部署。

---

## 📋 目录 / Table of Contents

1. [Node.js 直接部署](#nodejs-直接部署)
2. [Docker 容器部署](#docker-容器部署)  
3. [Docker Compose 部署](#docker-compose-部署)
4. [Nginx 反向代理](#nginx-反向代理)
5. [Systemd 服务配置](#systemd-服务配置)
6. [性能优化](#性能优化)

---

## 🚀 Node.js 直接部署

### 前置要求
- Node.js 16.13.0 或更高版本
- npm 或 yarn
- Linux/Unix 服务器（推荐 Ubuntu 20.04+）

### 步骤 1：安装 Node.js

#### Ubuntu/Debian:
```bash
# 使用 NodeSource 仓库安装最新 LTS 版本
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

#### CentOS/RHEL:
```bash
# 安装 Node.js LTS
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs

# 验证安装
node --version
npm --version
```

### 步骤 2：克隆项目

```bash
# 克隆仓库
cd /opt
sudo git clone https://github.com/longzheng268/proxygithub.git
cd proxygithub

# 设置权限
sudo chown -R $USER:$USER /opt/proxygithub
```

### 步骤 3：安装依赖

```bash
# 安装项目依赖
npm install

# 全局安装 wrangler（可选，用于本地测试）
sudo npm install -g wrangler
```

### 步骤 4：配置环境变量

创建 `.env` 文件：

```bash
cat > .env << EOF
# 可选配置
URL302=https://github.com/longzheng268/proxygithub
URL=nginx
UA=bot,spider,crawler
PORT=8787
HOST=0.0.0.0
EOF
```

### 步骤 5：使用 Wrangler 本地运行

```bash
# 开发模式（带热重载）
wrangler dev --local --port 8787

# 或者生产模式
wrangler dev --local --port 8787 --no-update-check
```

### 步骤 6：使用 Node.js HTTP 服务器（推荐生产环境）

创建 `server.js` 文件：

```javascript
// server.js - Node.js HTTP 服务器适配器
const http = require('http');
const worker = require('./worker.js');

const PORT = process.env.PORT || 8787;
const HOST = process.env.HOST || '0.0.0.0';

const server = http.createServer(async (req, res) => {
  try {
    // 构造 Request 对象
    const url = `http://${req.headers.host}${req.url}`;
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      headers.set(key, value);
    });

    let body = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await new Promise((resolve) => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
      });
    }

    const request = new Request(url, {
      method: req.method,
      headers: headers,
      body: body
    });

    // 调用 worker
    const response = await worker.default.fetch(request, process.env, {});

    // 返回响应
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const responseBody = await response.text();
    res.end(responseBody);
  } catch (error) {
    console.error('Server error:', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
```

启动服务器：

```bash
# 直接运行
node server.js

# 使用 PM2 管理（推荐）
sudo npm install -g pm2
pm2 start server.js --name proxygithub
pm2 save
pm2 startup
```

---

## 🐳 Docker 容器部署

### 方法 1：使用 Dockerfile

创建 `Dockerfile`:

```dockerfile
# Dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY package*.json ./
COPY worker.js ./
COPY wrangler.toml ./

# 安装依赖
RUN npm install --production
RUN npm install -g wrangler

# 暴露端口
EXPOSE 8787

# 启动命令
CMD ["wrangler", "dev", "--local", "--port", "8787", "--no-update-check"]
```

构建和运行：

```bash
# 构建镜像
docker build -t proxygithub:latest .

# 运行容器
docker run -d \
  --name proxygithub \
  -p 8787:8787 \
  -e URL302="https://github.com/longzheng268/proxygithub" \
  -e URL="nginx" \
  -e UA="bot,spider,crawler" \
  --restart unless-stopped \
  proxygithub:latest

# 查看日志
docker logs -f proxygithub

# 停止容器
docker stop proxygithub

# 启动容器
docker start proxygithub
```

### 方法 2：使用 Docker Hub 镜像（待发布）

```bash
# 拉取镜像
docker pull longzheng268/proxygithub:latest

# 运行
docker run -d \
  --name proxygithub \
  -p 8787:8787 \
  --restart unless-stopped \
  longzheng268/proxygithub:latest
```

---

## 🐙 Docker Compose 部署

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  proxygithub:
    build: .
    container_name: proxygithub
    ports:
      - "8787:8787"
    environment:
      - URL302=https://github.com/longzheng268/proxygithub
      - URL=nginx
      - UA=bot,spider,crawler
    restart: unless-stopped
    networks:
      - proxy_network

  # 可选：添加 Nginx 反向代理
  nginx:
    image: nginx:alpine
    container_name: proxygithub-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - proxygithub
    restart: unless-stopped
    networks:
      - proxy_network

networks:
  proxy_network:
    driver: bridge
```

使用 Docker Compose：

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 更新并重启
docker-compose pull
docker-compose up -d --build
```

---

## 🌐 Nginx 反向代理

### 配置文件 (`/etc/nginx/sites-available/proxygithub`)

```nginx
# HTTP -> HTTPS 重定向
server {
    listen 80;
    listen [::]:80;
    server_name proxygithub.yourdomain.com;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name proxygithub.yourdomain.com;

    # SSL 证书
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 反向代理配置
    location / {
        proxy_pass http://127.0.0.1:8787;
        proxy_http_version 1.1;
        
        # 代理头部
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 缓存配置
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 日志
    access_log /var/log/nginx/proxygithub_access.log;
    error_log /var/log/nginx/proxygithub_error.log;
}
```

启用配置：

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/proxygithub /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

### 获取免费 SSL 证书（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d proxygithub.yourdomain.com

# 自动续期测试
sudo certbot renew --dry-run
```

---

## ⚙️ Systemd 服务配置

创建服务文件 `/etc/systemd/system/proxygithub.service`:

```ini
[Unit]
Description=ProxyGitHub - GitHub & Docker Hub Proxy
After=network.target
Documentation=https://github.com/longzheng268/proxygithub

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/proxygithub
Environment="NODE_ENV=production"
Environment="PORT=8787"
Environment="HOST=127.0.0.1"
ExecStart=/usr/bin/node /opt/proxygithub/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=proxygithub

# 安全配置
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/proxygithub

[Install]
WantedBy=multi-user.target
```

管理服务：

```bash
# 重载 systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start proxygithub

# 设置开机自启
sudo systemctl enable proxygithub

# 查看状态
sudo systemctl status proxygithub

# 查看日志
sudo journalctl -u proxygithub -f

# 重启服务
sudo systemctl restart proxygithub

# 停止服务
sudo systemctl stop proxygithub
```

---

## 📊 性能优化

### 1. PM2 集群模式

```bash
# 使用 PM2 集群模式（多进程）
pm2 start server.js -i max --name proxygithub

# 查看进程
pm2 list

# 监控
pm2 monit
```

### 2. Nginx 缓存配置

在 Nginx 配置中添加：

```nginx
# 缓存路径
proxy_cache_path /var/cache/nginx/proxygithub levels=1:2 keys_zone=proxygithub_cache:10m max_size=1g inactive=60m;

server {
    # ... 其他配置

    location / {
        # 使用缓存
        proxy_cache proxygithub_cache;
        proxy_cache_valid 200 10m;
        proxy_cache_valid 404 1m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        proxy_cache_lock on;
        
        # 缓存键
        proxy_cache_key "$scheme$request_method$host$request_uri";
        
        # 添加缓存状态头
        add_header X-Cache-Status $upstream_cache_status;
        
        # ... 反向代理配置
    }
}
```

### 3. 系统优化

```bash
# 增加文件描述符限制
sudo tee -a /etc/security/limits.conf << EOF
* soft nofile 65536
* hard nofile 65536
EOF

# TCP 优化
sudo tee -a /etc/sysctl.conf << EOF
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 1200
net.ipv4.tcp_max_syn_backlog = 8192
net.core.somaxconn = 8192
EOF

sudo sysctl -p
```

---

## 🔍 监控和日志

### 使用 PM2 监控

```bash
# 实时监控
pm2 monit

# Web 监控界面
pm2 web

# 日志管理
pm2 logs proxygithub
pm2 logs proxygithub --lines 100
pm2 flush  # 清空日志
```

### Docker 日志

```bash
# 实时日志
docker logs -f proxygithub

# 最近 100 行
docker logs --tail 100 proxygithub

# 带时间戳
docker logs -f --timestamps proxygithub
```

### Nginx 日志

```bash
# 访问日志
sudo tail -f /var/log/nginx/proxygithub_access.log

# 错误日志
sudo tail -f /var/log/nginx/proxygithub_error.log

# 实时统计
sudo tail -f /var/log/nginx/proxygithub_access.log | awk '{print $7}' | sort | uniq -c | sort -rn
```

---

## 🔒 安全建议

1. **防火墙配置**
```bash
# UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8787/tcp  # 仅在测试时开放
sudo ufw enable
```

2. **限流配置** (Nginx)
```nginx
limit_req_zone $binary_remote_addr zone=proxygithub_limit:10m rate=10r/s;

server {
    location / {
        limit_req zone=proxygithub_limit burst=20 nodelay;
        # ... 其他配置
    }
}
```

3. **定期更新**
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 更新项目
cd /opt/proxygithub
git pull
npm install
pm2 restart proxygithub
```

---

## 📝 故障排除

### 服务无法启动

```bash
# 检查端口占用
sudo netstat -tlnp | grep 8787

# 检查日志
sudo journalctl -u proxygithub -n 50

# 检查配置
node server.js  # 直接运行查看错误
```

### Nginx 502 错误

```bash
# 检查后端服务
curl http://127.0.0.1:8787/

# 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 测试 Nginx 配置
sudo nginx -t
```

### Docker 容器无法访问

```bash
# 检查容器状态
docker ps -a

# 查看容器日志
docker logs proxygithub

# 进入容器调试
docker exec -it proxygithub sh
```

---

**部署完成后，通过 `http://your-server-ip:8787` 或配置的域名访问服务！** 🎉
