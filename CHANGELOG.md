# 更新日志 / Changelog

所有重要的项目更改都将记录在此文件中。

---

## [2.0.0] - 2024-11-17

### 🎨 重大 UI 更新 - 赛博朋克风格

**视觉设计革新：**
- 深色赛博朋克主题（#0a0e27 背景）
- 霓虹青色/洋红配色方案（#00ffff / #ff00ff）
- 动态网格背景动画
- CRT 扫描线效果
- 强烈的文字光晕效果
- 棱角分明的容器形状（clip-path）
- 故障动画和脉冲效果
- Matrix 绿色代码块
- 霓虹波纹点击效果

**交互增强：**
- 鼠标追踪霓虹光晕（青色/洋红渐变）
- 霓虹边框波纹点击动画
- 科技粒子浮动效果（带光晕）
- 容器故障入场动画
- 标题霓虹脉冲动画
- 卡片扫描线悬浮效果
- 按钮涟漪扩散效果

### 🖥️ 新增部署方式

**Node.js 服务器部署：**
- 新增 `server.js` - Node.js HTTP 服务器适配器
- 支持标准 HTTP/HTTPS 服务器部署
- 完整的 Request/Response 流式传输
- 优雅的进程关闭处理
- 精美的启动横幅

**Docker 容器化支持：**
- 新增 `Dockerfile` - 多阶段构建优化
- 新增 `docker-compose.yml` - 完整服务栈
- Alpine Linux 基础镜像（最小化）
- 非 root 用户运行（安全）
- 内置健康检查
- 支持 Node.js 和 Wrangler 双模式

**Nginx 反向代理：**
- 新增 `nginx-site.conf` - 生产级配置
- SSL/TLS 配置模板
- 代理缓存（10分钟，最大1GB）
- 限流保护（10 req/s，burst 20）
- 安全头部配置
- HTTP/2 支持
- WebSocket 支持

### 📚 完善文档

**新增文档：**
- `SERVER_DEPLOY.md` (10.6KB) - 服务器部署完整指南
  - Node.js 部署步骤（Ubuntu/CentOS）
  - Docker 部署教程
  - Docker Compose 配置
  - Nginx 反向代理设置
  - SSL 证书获取（Let's Encrypt）
  - Systemd 服务配置
  - PM2 进程管理
  - 性能优化建议
  - 监控和日志管理
  - 安全加固措施
  - 故障排除指南

**README 更新：**
- 新增部署方式对比表
- 新增 Node.js 部署说明
- 新增 Docker 部署说明
- 新增服务器部署链接
- 更新功能特性列表
- 更新 UI 截图展示

### 🛠️ package.json 增强

**新增 npm 脚本：**
```json
"start": "node server.js",
"start:wrangler": "wrangler dev --local --port 8787 --no-update-check",
"docker:build": "docker build -t proxygithub:latest .",
"docker:run": "docker run -d --name proxygithub -p 8787:8787 proxygithub:latest",
"docker:stop": "docker stop proxygithub",
"docker:logs": "docker logs -f proxygithub",
"compose:up": "docker-compose up -d",
"compose:down": "docker-compose down",
"compose:logs": "docker-compose logs -f"
```

### ✨ 功能完善

**保持 100% 兼容：**
- ✅ 所有 Docker 代理功能
- ✅ GitHub 代理功能
- ✅ 快速导航按钮
- ✅ 模块化架构
- ✅ Git 操作支持

**新增能力：**
- ✅ VPS 直接部署
- ✅ Docker 容器化
- ✅ 生产环境部署
- ✅ 反向代理支持
- ✅ 服务管理支持

### 🔧 技术改进

**架构优化：**
- 模块化错误隔离
- Git 客户端检测
- 流式响应处理
- 优雅关闭支持

**安全增强：**
- 非 root 用户运行
- 安全头部配置
- 限流和连接限制
- 进程沙箱化

**性能优化：**
- 多阶段 Docker 构建
- 代理缓存配置
- PM2 集群模式支持
- CDN 缓存策略

---

## [1.0.0] - 2024-11-17

### ✨ 首次发布

**基础功能：**
- Cloudflare Workers 部署支持
- GitHub 代理完整功能
- Docker Hub 多仓库代理
- 现代化渐变 UI
- 响应式移动端适配
- 交互式动画效果

---

## 版本说明 / Version Notes

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范。

版本格式：`主版本号.次版本号.修订号`

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

---

## 即将推出 / Coming Soon

- [ ] Web UI 配置管理面板
- [ ] 更多镜像仓库支持
- [ ] 访问统计功能
- [ ] 自定义缓存策略
- [ ] Kubernetes Helm Chart
- [ ] Terraform 部署模板

---

## 贡献者 / Contributors

感谢所有为本项目做出贡献的开发者！

- [@longzheng268](https://github.com/longzheng268) - 项目创建者

---

**[查看完整历史记录](https://github.com/longzheng268/proxygithub/commits/main)**
