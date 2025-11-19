# 🚀 ProxyGitHub - GitHub & Docker Hub 加速代理

<div align="center">

[![License](https://img.shields.io/github/license/longzheng268/proxygithub)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)
[![GitHub Stars](https://img.shields.io/github/stars/longzheng268/proxygithub)](https://github.com/longzheng268/proxygithub/stargazers)

**一个基于 Cloudflare Workers 的高性能 GitHub 和 Docker Hub 代理服务**

**🆕 现已支持 Node.js 服务器和 Docker 部署！**

[简体中文](#简体中文) | [English](#english) | [部署指南](DEPLOY.md) | [服务器部署](SERVER_DEPLOY.md)

![GitHub Proxy](https://github.com/user-attachments/assets/7d7c9f84-5685-4ab5-96ce-b951d3e2d18b)

</div>

---

## 简体中文

### ✨ 特性

- 🌍 **全球加速** - 利用 Cloudflare 的全球 CDN 网络，提供极速访问
- 🔒 **安全可靠** - 所有请求通过 HTTPS 加密传输
- 🛡️ **防滥用保护** - 支持 IP 地理位置限制，防止国外扫描和滥用投诉
- 💰 **完全免费** - 基于 Cloudflare Workers 免费计划
- 🎯 **模块化设计** - 即使某个功能出错，其他功能仍可正常使用
- ⚡ **零配置使用** - 部署后即可直接使用，无需复杂配置
- 🐳 **Docker 加速** - 支持 Docker Hub、GCR、GHCR 等多个镜像仓库
- 📦 **Git 完美兼容** - 支持 git clone、pull、push 等所有 Git 操作
- 🎨 **精美UI界面** - 现代化设计，响应式布局，支持移动端
- ✨ **动效交互** - 鼠标追踪光效、点击波纹、悬浮动画等流畅特效
- 🔘 **一键导航** - 内置 GitHub 首页、热门项目等快捷按钮，无需手动修改地址

### 🎨 界面特性

- **响应式设计** - 完美适配桌面、平板、手机
- **双模式切换** - GitHub 和 Docker 代理快速切换
- **实时生成** - 即时生成代理链接，支持复制到剪贴板
- **交互动效**：
  - 🌟 鼠标追踪光晕效果
  - 💫 点击波纹扩散动画
  - ✨ 悬浮卡片旋转特效
  - 🎭 背景浮动粒子效果
  - 🎯 按钮涟漪动画
- **快捷导航** - 一键访问 GitHub 首页、热门项目、探索页面

<details>
<summary>📱 查看更多截图 / View More Screenshots</summary>

**桌面视图 - Docker 代理**
![Docker Proxy](https://github.com/user-attachments/assets/ec7e0889-07ad-400a-a88f-05e4925f2a01)

**移动端视图 - 完美适配**
![Mobile View](https://github.com/user-attachments/assets/a5639742-64e9-4746-bfd8-010735272d2f)

</details>

### 📋 功能说明

#### GitHub 代理功能

支持以下 GitHub 服务的代理访问：

| 功能 | 用法示例 |
|------|----------|
| 浏览仓库 | `https://你的域名/https://github.com/OWNER/REPO` |
| 目录浏览 | `https://你的域名/https://github.com/OWNER/REPO/tree/BRANCH/path` |
| 文件查看 | `https://你的域名/https://github.com/OWNER/REPO/blob/BRANCH/path/to/file` |
| Raw 文件 | `https://你的域名/https://raw.githubusercontent.com/OWNER/REPO/BRANCH/path/to/file` |
| API 访问 | `https://你的域名/https://api.github.com/repos/OWNER/REPO` |
| Git Clone | `git clone https://你的域名/https://github.com/OWNER/REPO.git` |

**快捷导航功能**：
- 🏠 一键访问 GitHub 首页
- 🔥 快速查看热门项目
- 🧭 探索开源世界
- 无需手动修改 URL，体验如同直接浏览 GitHub

#### Docker Hub 代理功能

支持多个容器镜像仓库：

- ✅ Docker Hub (docker.io)
- ✅ Google Container Registry (gcr.io)
- ✅ GitHub Container Registry (ghcr.io)
- ✅ Quay.io
- ✅ Kubernetes Registry (registry.k8s.io)
- ✅ NVIDIA GPU Cloud (nvcr.io)
- ✅ Cloudsmith (docker.cloudsmith.io)

### 🚀 快速开始

#### 🎯 部署方式对比

| 方式 | 适用场景 | 难度 | 成本 |
|------|----------|------|------|
| [Cloudflare Workers](#方法一一键部署推荐新手) | 个人使用，轻量级 | ⭐ 简单 | 免费 |
| [Node.js 服务器](#node.js-服务器部署) | 需要完全控制 | ⭐⭐ 中等 | VPS 费用 |
| [Docker 容器](#docker-部署) | 生产环境，易迁移 | ⭐⭐ 中等 | VPS 费用 |

#### 方法一：一键部署（推荐新手）

**Cloudflare Workers - 零配置，一键部署**

1. **注册 Cloudflare 账号**
   - 访问 [Cloudflare](https://dash.cloudflare.com/sign-up)
   - 免费注册一个账号

2. **点击一键部署**
   
   [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/longzheng268/proxygithub)

3. **完成部署**
   - 按照提示授权 GitHub
   - 选择仓库并完成部署
   - 获取分配的 `*.workers.dev` 域名

4. **开始使用**
   ```bash
   # 测试 GitHub 代理
   git clone https://你的域名.workers.dev/https://github.com/torvalds/linux.git
   
   # 测试 Docker 代理
   docker pull 你的域名.workers.dev/library/nginx:latest
   ```

#### 方法二：Node.js 服务器部署

**适合有 VPS 的用户，完全控制**

```bash
# 1. 克隆仓库
git clone https://github.com/longzheng268/proxygithub.git
cd proxygithub

# 2. 安装依赖
npm install

# 3. 启动服务
npm start

# 或使用 PM2（推荐生产环境）
npm install -g pm2
pm2 start server.js --name proxygithub
pm2 save
pm2 startup
```

访问 `http://your-server-ip:8787`

📚 **详细文档**: [服务器部署指南](SERVER_DEPLOY.md)

#### 方法三：Docker 部署

**适合容器化部署，易于迁移**

```bash
# 使用 Docker
docker build -t proxygithub .
docker run -d --name proxygithub -p 8787:8787 --restart unless-stopped proxygithub

# 或使用 Docker Compose（推荐）
docker-compose up -d

# 查看日志
docker-compose logs -f
```

访问 `http://your-server-ip:8787`

📚 **详细文档**: [Docker 部署指南](SERVER_DEPLOY.md#docker-容器部署)

#### 方法四：使用 Wrangler CLI（推荐开发者）

**前置要求：**
- Node.js 16.13.0 或更高版本
- npm 或 yarn

**部署步骤：**

```bash
# 1. 克隆仓库
git clone https://github.com/longzheng268/proxygithub.git
cd proxygithub

# 2. 安装 Wrangler CLI
npm install -g wrangler

# 3. 登录 Cloudflare
wrangler login

# 4. 部署到 Cloudflare Workers
wrangler deploy

# 5. 查看部署信息
wrangler deployments list
```

部署成功后，你会得到一个类似 `https://proxygithub.你的账号.workers.dev` 的地址。

#### 方法三：手动部署

1. **登录 Cloudflare Dashboard**
   - 访问 [Cloudflare Workers](https://dash.cloudflare.com/)
   - 进入 `Workers & Pages`

2. **创建新 Worker**
   - 点击 `Create application`
   - 选择 `Create Worker`
   - 给你的 Worker 命名（例如：proxygithub）

3. **复制代码**
   - 点击 `Quick edit`
   - 删除默认代码
   - 复制 [worker.js](worker.js) 的全部内容
   - 粘贴到编辑器中

4. **保存并部署**
   - 点击 `Save and Deploy`
   - 复制分配的 Worker 地址

### 🚨 重要：防止滥用配置（推荐）

**如果您担心被国外公司扫描或收到滥用投诉，强烈建议启用 IP 地理位置限制：**

#### 快速配置（仅允许中国大陆访问）

使用 Wrangler CLI:
```bash
# 1. 启用地理位置限制
wrangler secret put GEO_RESTRICTION_ENABLED
# 输入: true

# 2. 设置为白名单模式
wrangler secret put GEO_RESTRICTION_MODE
# 输入: whitelist

# 3. 只允许中国大陆访问
wrangler secret put ALLOWED_COUNTRIES
# 输入: CN

# 4. 重新部署
wrangler deploy
```

或在 Cloudflare Dashboard 中配置：
1. 进入你的 Worker 设置
2. 点击 `Settings` -> `Variables`
3. 添加以下环境变量：
   - `GEO_RESTRICTION_ENABLED` = `true`
   - `GEO_RESTRICTION_MODE` = `whitelist`
   - `ALLOWED_COUNTRIES` = `CN`

**更多高级配置和其他国家设置，请参考 [SECURITY.md](SECURITY.md)**

### 📖 使用指南

#### GitHub 使用示例

**1. Git Clone 加速**
```bash
# 原始地址
git clone https://github.com/microsoft/vscode.git

# 使用代理加速
git clone https://你的域名/https://github.com/microsoft/vscode.git
```

**2. 下载 Release 文件**
```bash
# 原始地址
wget https://github.com/OWNER/REPO/releases/download/v1.0.0/file.tar.gz

# 使用代理加速
wget https://你的域名/https://github.com/OWNER/REPO/releases/download/v1.0.0/file.tar.gz
```

**3. Raw 文件访问**
```bash
# 原始地址
curl https://raw.githubusercontent.com/OWNER/REPO/main/README.md

# 使用代理加速
curl https://你的域名/https://raw.githubusercontent.com/OWNER/REPO/main/README.md
```

#### Docker 使用示例

**1. 配置 Docker 镜像加速**

创建或编辑 `/etc/docker/daemon.json`:

```json
{
  "registry-mirrors": ["https://你的域名"]
}
```

重启 Docker 服务：
```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

**2. 拉取镜像**
```bash
# Docker Hub 官方镜像
docker pull 你的域名/library/nginx:latest
docker pull 你的域名/library/mysql:8.0

# Docker Hub 用户镜像
docker pull 你的域名/username/image:tag

# Google Container Registry
docker pull gcr.你的域名/project-id/image:tag

# GitHub Container Registry
docker pull ghcr.你的域名/owner/image:tag

# Kubernetes Registry
docker pull k8s.你的域名/pause:3.9
```

### ⚙️ 高级配置

#### 环境变量

在 Cloudflare Workers 设置中添加环境变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `URL302` | 首页 302 重定向地址 | `https://github.com/longzheng268/proxygithub` |
| `URL` | 自定义首页地址，或填写 `nginx` 显示伪装页 | `nginx` 或 `https://example.com` |
| `UA` | 屏蔽的 User-Agent（逗号分隔） | `bot,spider,crawler` |
| `GEO_RESTRICTION_ENABLED` | 启用 IP 地理位置限制 | `true` 或 `false` |
| `GEO_RESTRICTION_MODE` | 地理限制模式 | `whitelist` 或 `blacklist` |
| `ALLOWED_COUNTRIES` | 白名单模式允许的国家代码 | `CN,HK,TW` |
| `BLOCKED_COUNTRIES` | 黑名单模式阻止的国家代码 | `US,GB` |
| `RATE_LIMIT_ENABLED` | 启用速率限制 | `true` 或 `false` |
| `RATE_LIMIT_PER_MINUTE` | 每分钟请求数限制 | `60` |

**设置环境变量：**

使用 Wrangler:
```bash
wrangler secret put URL302
# 输入值后按回车

wrangler secret put UA
# 输入值后按回车

# 启用 IP 地理位置限制（仅允许中国大陆访问）
wrangler secret put GEO_RESTRICTION_ENABLED
# 输入: true
wrangler secret put GEO_RESTRICTION_MODE
# 输入: whitelist
wrangler secret put ALLOWED_COUNTRIES
# 输入: CN

# 启用速率限制
wrangler secret put RATE_LIMIT_ENABLED
# 输入: true
wrangler secret put RATE_LIMIT_PER_MINUTE
# 输入: 60
```

或在 Cloudflare Dashboard:
1. 进入你的 Worker
2. 点击 `Settings` -> `Variables`
3. 添加环境变量

📖 **详细安全配置指南**: 请参考 [SECURITY.md](SECURITY.md) 了解 IP 地理位置限制和速率限制的完整配置说明。

#### 自定义域名

**使用 Wrangler:**

编辑 `wrangler.toml`:
```toml
[[routes]]
pattern = "proxygithub.yourdomain.com/*"
zone_name = "yourdomain.com"
```

部署：
```bash
wrangler deploy
```

**使用 Dashboard:**
1. 在 Cloudflare 中添加你的域名
2. 进入 Worker 设置
3. 点击 `Triggers` -> `Add Custom Domain`
4. 输入你的子域名（如 `proxygithub.yourdomain.com`）

### 🏗️ 架构设计

本项目采用模块化设计，确保高可用性：

```
┌─────────────────────────────────────────────┐
│         Cloudflare Workers Entry            │
│                (主路由)                      │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
    ┌────▼─────┐      ┌─────▼────┐
    │  GitHub  │      │  Docker  │
    │  代理模块 │      │  代理模块 │
    │  (独立)  │      │  (独立)  │
    └────┬─────┘      └─────┬────┘
         │                   │
         │    ┌──────────┐   │
         └────►  错误处理 ◄───┘
              │  (隔离)  │
              └──────────┘
```

**关键特性：**
- ✅ GitHub 和 Docker 模块完全独立
- ✅ 单个模块错误不影响其他功能
- ✅ Git Clone 等核心功能优先保障
- ✅ 详细错误日志便于排查

### 🔧 故障排除

#### Git Clone 失败

**症状：** `fatal: unable to access 'https://...': Failed to connect`

**解决方案：**
```bash
# 方法 1: 检查 URL 格式
git clone https://你的域名/https://github.com/OWNER/REPO.git

# 方法 2: 设置 Git 代理（如果你在中国大陆）
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 方法 3: 增加缓冲区大小
git config --global http.postBuffer 524288000
```

#### Docker Pull 失败

**症状：** `Error response from daemon: Get https://...`

**解决方案：**
```bash
# 1. 检查 daemon.json 配置
cat /etc/docker/daemon.json

# 2. 重启 Docker 服务
sudo systemctl restart docker

# 3. 直接指定镜像地址
docker pull 你的域名/library/nginx:latest

# 4. 清理 Docker 缓存
docker system prune -a
```

#### Workers 部署失败

**症状：** `Error: Failed to publish your Function`

**解决方案：**
```bash
# 1. 检查 Wrangler 版本
wrangler --version

# 2. 更新 Wrangler
npm install -g wrangler@latest

# 3. 清除缓存重新登录
wrangler logout
wrangler login

# 4. 重新部署
wrangler deploy
```

### 📊 性能优化

1. **启用缓存**
   - GitHub 文件自动缓存 25 分钟
   - Docker 镜像层缓存 1 小时

2. **CDN 加速**
   - 自动使用最近的 Cloudflare 节点
   - 全球 200+ 数据中心

3. **请求限制**
   - Cloudflare Workers 免费版：100,000 请求/天
   - 建议升级付费版以获得更高配额

### 🛡️ 安全功能

本项目新增了多项安全功能，帮助防止滥用和保护服务：

#### IP 地理位置限制

通过配置环境变量，可以限制只允许特定国家/地区访问服务：

```bash
# 启用地理位置限制，仅允许中国大陆访问
GEO_RESTRICTION_ENABLED=true
GEO_RESTRICTION_MODE=whitelist
ALLOWED_COUNTRIES=CN
```

**使用场景：**
- 防止国外公司扫描导致的滥用投诉
- 将服务限制在国内使用
- 减少带宽消耗和请求配额

#### 速率限制

防止单个 IP 在短时间内发起过多请求：

```bash
# 启用速率限制，每分钟最多 60 个请求
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=60
```

**优势：**
- 防止 DDoS 攻击
- 避免触发上游 API 的速率限制（HAP429 错误）
- 确保服务对所有用户的公平访问
- 降低 Cloudflare Workers 使用成本

📖 **完整配置指南**: 请查看 [SECURITY.md](SECURITY.md) 了解详细配置说明和最佳实践。

### 🛡️ 安全说明

- ✅ 所有请求通过 HTTPS 加密
- ✅ 不记录用户访问日志
- ✅ 不修改传输数据内容
- ✅ 支持 User-Agent 黑名单
- ⚠️ 请勿用于非法用途

### 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

```bash
# Fork 本仓库
# 克隆你的 Fork
git clone https://github.com/你的用户名/proxygithub.git

# 创建新分支
git checkout -b feature/your-feature

# 提交更改
git commit -am 'Add some feature'

# 推送到分支
git push origin feature/your-feature

# 创建 Pull Request
```

### 📝 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解详细更新历史。

### 📄 许可证

本项目基于 [LICENSE](LICENSE) 开源。

### 🙏 致谢

- [Cloudflare Workers](https://workers.cloudflare.com/) - 提供免费的边缘计算平台
- 所有贡献者和支持者

### 📮 联系方式

- 提交 Issue: [GitHub Issues](https://github.com/longzheng268/proxygithub/issues)
- 讨论区: [GitHub Discussions](https://github.com/longzheng268/proxygithub/discussions)

---

## English

### ✨ Features

- 🌍 **Global Acceleration** - Powered by Cloudflare's global CDN network
- 🔒 **Secure & Reliable** - All requests encrypted via HTTPS
- 🛡️ **Abuse Prevention** - IP geolocation restrictions to prevent overseas scanning and abuse complaints
- 💰 **Completely Free** - Based on Cloudflare Workers free plan
- 🎯 **Modular Design** - Other functions work even if one fails
- ⚡ **Zero Configuration** - Ready to use after deployment
- 🐳 **Docker Acceleration** - Supports Docker Hub, GCR, GHCR, and more
- 📦 **Full Git Compatibility** - Supports all Git operations
- 🎨 **Beautiful UI** - Modern design, responsive layout, mobile-friendly
- ✨ **Interactive Effects** - Mouse tracking glow, click ripples, hover animations
- 🔘 **One-Click Navigation** - Quick access to GitHub homepage, trending, and more

### 🎨 UI Features

- **Responsive Design** - Perfect for desktop, tablet, and mobile
- **Dual Mode** - Quick switch between GitHub and Docker proxy
- **Real-time Generation** - Instant proxy link generation with clipboard support
- **Interactive Effects**:
  - 🌟 Mouse tracking glow effect
  - 💫 Click ripple animation
  - ✨ Card hover rotation
  - 🎭 Floating particle background
  - 🎯 Button ripple effects
- **Quick Navigation** - One-click access to GitHub home, trending, and explore pages

### 📋 Features

#### GitHub Proxy

| Feature | Usage Example |
|---------|---------------|
| Browse Repository | `https://your-domain/https://github.com/OWNER/REPO` |
| Browse Directory | `https://your-domain/https://github.com/OWNER/REPO/tree/BRANCH/path` |
| View File | `https://your-domain/https://github.com/OWNER/REPO/blob/BRANCH/path/to/file` |
| Raw File | `https://your-domain/https://raw.githubusercontent.com/OWNER/REPO/BRANCH/path/to/file` |
| API Access | `https://your-domain/https://api.github.com/repos/OWNER/REPO` |
| Git Clone | `git clone https://your-domain/https://github.com/OWNER/REPO.git` |

**Quick Navigation**:
- 🏠 One-click GitHub homepage
- 🔥 Quick access to trending repositories
- 🧭 Explore the open-source world
- No manual URL editing, experience just like browsing GitHub directly

#### Docker Hub Proxy

Supported registries:
- ✅ Docker Hub (docker.io)
- ✅ Google Container Registry (gcr.io)
- ✅ GitHub Container Registry (ghcr.io)
- ✅ Quay.io
- ✅ Kubernetes Registry (registry.k8s.io)
- ✅ NVIDIA GPU Cloud (nvcr.io)
- ✅ Cloudsmith (docker.cloudsmith.io)

### 🚀 Quick Start

#### Method 1: One-Click Deploy (Recommended for Beginners)

1. **Sign up for Cloudflare**
   - Visit [Cloudflare](https://dash.cloudflare.com/sign-up)
   - Create a free account

2. **Click Deploy**
   
   [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/longzheng268/proxygithub)

3. **Complete Deployment**
   - Authorize GitHub
   - Select repository and complete deployment
   - Get your `*.workers.dev` domain

4. **Start Using**
   ```bash
   # Test GitHub proxy
   git clone https://your-domain.workers.dev/https://github.com/torvalds/linux.git
   
   # Test Docker proxy
   docker pull your-domain.workers.dev/library/nginx:latest
   ```

#### Method 2: Wrangler CLI (Recommended for Developers)

**Prerequisites:**
- Node.js 16.13.0 or higher
- npm or yarn

**Deployment Steps:**

```bash
# 1. Clone repository
git clone https://github.com/longzheng268/proxygithub.git
cd proxygithub

# 2. Install Wrangler CLI
npm install -g wrangler

# 3. Login to Cloudflare
wrangler login

# 4. Deploy to Cloudflare Workers
wrangler deploy

# 5. View deployment info
wrangler deployments list
```

### 📖 Usage Guide

#### GitHub Examples

**1. Git Clone Acceleration**
```bash
# Original
git clone https://github.com/microsoft/vscode.git

# With proxy
git clone https://your-domain/https://github.com/microsoft/vscode.git
```

**2. Download Release Files**
```bash
# Original
wget https://github.com/OWNER/REPO/releases/download/v1.0.0/file.tar.gz

# With proxy
wget https://your-domain/https://github.com/OWNER/REPO/releases/download/v1.0.0/file.tar.gz
```

#### Docker Examples

**1. Configure Docker Registry Mirror**

Create or edit `/etc/docker/daemon.json`:

```json
{
  "registry-mirrors": ["https://your-domain"]
}
```

Restart Docker:
```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

**2. Pull Images**
```bash
# Docker Hub official
docker pull your-domain/library/nginx:latest

# Google Container Registry
docker pull gcr.your-domain/project-id/image:tag

# GitHub Container Registry
docker pull ghcr.your-domain/owner/image:tag
```

### ⚙️ Advanced Configuration

#### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `URL302` | Home page 302 redirect | `https://github.com/longzheng268/proxygithub` |
| `URL` | Custom home page or `nginx` for fake page | `nginx` |
| `UA` | Blocked User-Agents (comma-separated) | `bot,spider,crawler` |
| `GEO_RESTRICTION_ENABLED` | Enable IP geolocation restrictions | `true` or `false` |
| `GEO_RESTRICTION_MODE` | Restriction mode | `whitelist` or `blacklist` |
| `ALLOWED_COUNTRIES` | Allowed countries in whitelist mode | `CN,HK,TW` |
| `BLOCKED_COUNTRIES` | Blocked countries in blacklist mode | `US,GB` |
| `RATE_LIMIT_ENABLED` | Enable rate limiting | `true` or `false` |
| `RATE_LIMIT_PER_MINUTE` | Requests per minute limit | `60` |

**Set environment variables:**

```bash
wrangler secret put URL302
wrangler secret put UA

# Enable IP geolocation restriction (China only)
wrangler secret put GEO_RESTRICTION_ENABLED
# Input: true
wrangler secret put GEO_RESTRICTION_MODE
# Input: whitelist
wrangler secret put ALLOWED_COUNTRIES
# Input: CN

# Enable rate limiting
wrangler secret put RATE_LIMIT_ENABLED
# Input: true
wrangler secret put RATE_LIMIT_PER_MINUTE
# Input: 60
```

📖 **Security Configuration Guide**: See [SECURITY.md](SECURITY.md) for detailed configuration instructions on IP geolocation restrictions and rate limiting.

### 🛡️ Security Features

This project includes security features to help prevent abuse and protect the service:

#### IP Geolocation Restrictions

Restrict access to specific countries/regions by configuring environment variables:

```bash
# Enable geolocation restriction, allow China only
GEO_RESTRICTION_ENABLED=true
GEO_RESTRICTION_MODE=whitelist
ALLOWED_COUNTRIES=CN
```

**Use Cases:**
- Prevent abuse complaints from overseas scanning
- Limit service to domestic use
- Reduce bandwidth consumption and request quota

#### Rate Limiting

Prevent a single IP from making too many requests in a short time:

```bash
# Enable rate limiting, max 60 requests per minute
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=60
```

**Benefits:**
- Prevent DDoS attacks
- Avoid upstream API rate limits (HAP429 errors)
- Ensure fair access for all users
- Reduce Cloudflare Workers costs

📖 **Complete Guide**: See [SECURITY.md](SECURITY.md) for detailed configuration and best practices.

### 🔧 Troubleshooting

#### Git Clone Fails

```bash
# Check URL format
git clone https://your-domain/https://github.com/OWNER/REPO.git

# Increase buffer size
git config --global http.postBuffer 524288000
```

#### Docker Pull Fails

```bash
# Restart Docker
sudo systemctl restart docker

# Use full mirror path
docker pull your-domain/library/nginx:latest
```

### 📄 License

This project is licensed under the [LICENSE](LICENSE).

### 🙏 Acknowledgments

- [Cloudflare Workers](https://workers.cloudflare.com/)
- All contributors and supporters

---

<div align="center">

**如果这个项目帮助到你，请给它一个 ⭐ Star！**

**If this project helps you, please give it a ⭐ Star!**

Made with ❤️ by [longzheng268](https://github.com/longzheng268)

</div>

