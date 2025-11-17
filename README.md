# 🚀 ProxyGitHub - GitHub & Docker Hub 加速代理

<div align="center">

[![License](https://img.shields.io/github/license/longzheng268/proxygithub)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)
[![GitHub Stars](https://img.shields.io/github/stars/longzheng268/proxygithub)](https://github.com/longzheng268/proxygithub/stargazers)

**一个基于 Cloudflare Workers 的高性能 GitHub 和 Docker Hub 代理服务**

[简体中文](#简体中文) | [English](#english)

</div>

---

## 简体中文

### ✨ 特性

- 🌍 **全球加速** - 利用 Cloudflare 的全球 CDN 网络，提供极速访问
- 🔒 **安全可靠** - 所有请求通过 HTTPS 加密传输
- 💰 **完全免费** - 基于 Cloudflare Workers 免费计划
- 🎯 **模块化设计** - 即使某个功能出错，其他功能仍可正常使用
- ⚡ **零配置使用** - 部署后即可直接使用，无需复杂配置
- 🐳 **Docker 加速** - 支持 Docker Hub、GCR、GHCR 等多个镜像仓库
- 📦 **Git 完美兼容** - 支持 git clone、pull、push 等所有 Git 操作

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

#### 方法一：一键部署（推荐新手）

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

#### 方法二：使用 Wrangler CLI（推荐开发者）

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

**设置环境变量：**

使用 Wrangler:
```bash
wrangler secret put URL302
# 输入值后按回车

wrangler secret put UA
# 输入值后按回车
```

或在 Cloudflare Dashboard:
1. 进入你的 Worker
2. 点击 `Settings` -> `Variables`
3. 添加环境变量

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
- 💰 **Completely Free** - Based on Cloudflare Workers free plan
- 🎯 **Modular Design** - Other functions work even if one fails
- ⚡ **Zero Configuration** - Ready to use after deployment
- 🐳 **Docker Acceleration** - Supports Docker Hub, GCR, GHCR, and more
- 📦 **Full Git Compatibility** - Supports all Git operations

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

**Set environment variables:**

```bash
wrangler secret put URL302
wrangler secret put UA
```

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

