# 🚀 部署指南 / Deployment Guide

## 快速部署 / Quick Deploy

### 方法一：一键部署（推荐）/ Method 1: One-Click Deploy (Recommended)

点击下方按钮一键部署到 Cloudflare Workers：

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/longzheng268/proxygithub)

### 方法二：Wrangler CLI / Method 2: Wrangler CLI

```bash
# 1. 克隆仓库 / Clone repository
git clone https://github.com/longzheng268/proxygithub.git
cd proxygithub

# 2. 安装 Wrangler / Install Wrangler
npm install -g wrangler

# 3. 登录 Cloudflare / Login to Cloudflare
wrangler login

# 4. 部署 / Deploy
wrangler deploy

# 5. 查看部署信息 / View deployment
wrangler deployments list
```

### 方法三：手动部署 / Method 3: Manual Deploy

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 `Workers & Pages`
3. 点击 `Create application` → `Create Worker`
4. 给 Worker 命名（例如：proxygithub）
5. 点击 `Quick edit`
6. 复制 `worker.js` 的全部内容
7. 粘贴到编辑器并点击 `Save and Deploy`

## 环境变量配置（可选）/ Environment Variables (Optional)

在 Cloudflare Workers 设置中添加以下环境变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `URL302` | 首页 302 重定向地址 | `https://github.com/longzheng268/proxygithub` |
| `URL` | 自定义首页或 `nginx` 伪装页 | `nginx` |
| `UA` | 屏蔽的 User-Agent（逗号分隔） | `bot,spider,crawler` |

### 使用 Wrangler 设置环境变量：

```bash
wrangler secret put URL302
wrangler secret put UA
```

## 自定义域名 / Custom Domain

### 使用 Wrangler：

编辑 `wrangler.toml`：

```toml
[[routes]]
pattern = "proxygithub.yourdomain.com/*"
zone_name = "yourdomain.com"
```

然后部署：

```bash
wrangler deploy
```

### 使用 Dashboard：

1. 在 Cloudflare 中添加你的域名
2. 进入 Worker 设置
3. 点击 `Triggers` → `Add Custom Domain`
4. 输入你的子域名（如 `proxygithub.yourdomain.com`）

## 使用说明 / Usage

部署成功后，你会得到一个类似的地址：
```
https://proxygithub.你的账号.workers.dev
```

### GitHub 代理使用：

```bash
# Git Clone
git clone https://your-domain.workers.dev/https://github.com/owner/repo.git

# 下载文件
wget https://your-domain.workers.dev/https://github.com/owner/repo/releases/download/v1.0.0/file.tar.gz

# API 访问
curl https://your-domain.workers.dev/https://api.github.com/repos/owner/repo
```

### Docker 代理使用：

1. 配置 Docker 镜像加速：

编辑 `/etc/docker/daemon.json`：

```json
{
  "registry-mirrors": ["https://your-domain.workers.dev"]
}
```

2. 重启 Docker：

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

3. 拉取镜像：

```bash
docker pull your-domain.workers.dev/library/nginx:latest
```

## 验证部署 / Verify Deployment

访问你的域名，应该看到精美的主页界面。

测试 GitHub 代理：
```bash
curl https://your-domain.workers.dev/https://api.github.com/
```

测试 Docker 代理：
```bash
curl https://your-domain.workers.dev/v2/
```

## 故障排除 / Troubleshooting

### 部署失败

```bash
# 更新 Wrangler
npm install -g wrangler@latest

# 清除缓存重新登录
wrangler logout
wrangler login

# 重新部署
wrangler deploy
```

### Git Clone 失败

```bash
# 增加缓冲区大小
git config --global http.postBuffer 524288000

# 使用正确的 URL 格式
git clone https://your-domain/https://github.com/owner/repo.git
```

### Docker Pull 失败

```bash
# 检查配置
cat /etc/docker/daemon.json

# 重启 Docker
sudo systemctl restart docker

# 使用完整路径
docker pull your-domain/library/nginx:latest
```

## 性能优化 / Performance

- Cloudflare Workers 免费版：100,000 请求/天
- 建议为生产环境使用付费版获得更高配额
- 自动 CDN 缓存：GitHub 文件 25 分钟，Docker 层 1 小时

## 安全建议 / Security Tips

- 定期更新 Worker 代码
- 监控请求日志（在 Cloudflare Dashboard）
- 配置自定义域名以增加可信度
- 启用 User-Agent 过滤防止滥用

## 支持 / Support

- 📮 [提交 Issue](https://github.com/longzheng268/proxygithub/issues)
- 💬 [讨论区](https://github.com/longzheng268/proxygithub/discussions)
- 📖 [完整文档](README.md)

---

**祝你使用愉快！ / Happy Coding!** 🎉
