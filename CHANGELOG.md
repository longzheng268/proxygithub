# 更新日志 / Changelog

所有重要的项目更改都将记录在此文件中。

---

## [1.0.0] - 2024-11-17

### ✨ 新增功能 / Added

- 🎯 **模块化架构设计**
  - GitHub 代理模块和 Docker 代理模块完全独立
  - 单个模块故障不影响其他功能
  - 优先保障 Git Clone 等核心功能

- 🌐 **GitHub 代理完整支持**
  - 支持仓库浏览 (github.com)
  - 支持 Raw 文件访问 (raw.githubusercontent.com)
  - 支持 API 访问 (api.github.com)
  - 支持 Gist (gist.github.com)
  - 支持代码下载 (codeload.github.com)
  - 完美支持 git clone/pull/push 操作

- 🐳 **Docker 镜像加速**
  - Docker Hub (docker.io)
  - Google Container Registry (gcr.io)
  - GitHub Container Registry (ghcr.io)
  - Quay.io
  - Kubernetes Registry (registry.k8s.io)
  - NVIDIA GPU Cloud (nvcr.io)
  - Cloudsmith (docker.cloudsmith.io)

- 🎨 **现代化 UI 界面**
  - 响应式设计，支持移动端
  - 美观的渐变背景
  - GitHub 和 Docker 双标签切换
  - 实时代理链接生成器
  - 详细的使用说明和示例

- ⚙️ **灵活配置**
  - 环境变量支持 (URL302, URL, UA)
  - 自定义域名支持
  - User-Agent 过滤
  - 可选 nginx 伪装页

- 📦 **一键部署**
  - Cloudflare Workers Deploy Button
  - Wrangler CLI 支持
  - 详细的部署文档

- 📚 **完善文档**
  - 中英文双语 README
  - 新手友好的快速开始指南
  - 详细的使用示例
  - 故障排除指南
  - 性能优化建议

### 🔒 安全性 / Security

- HTTPS 强制加密
- 不记录用户日志
- 不修改传输内容
- User-Agent 黑名单支持

### 🚀 性能优化 / Performance

- CDN 缓存支持
- 全球 200+ 节点加速
- 智能路由选择
- 请求头优化

### 📖 文档 / Documentation

- 新增详细的 README.md
- 新增 wrangler.toml 配置文件
- 新增 CHANGELOG.md
- 代码注释完善

---

## 版本说明 / Version Notes

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范。

版本格式：`主版本号.次版本号.修订号`

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

---

## 即将推出 / Coming Soon

- [ ] 更多镜像仓库支持
- [ ] 访问统计功能
- [ ] 自定义缓存策略
- [ ] 批量链接转换工具
- [ ] Docker Compose 示例
- [ ] GitHub Actions 集成示例

---

## 贡献者 / Contributors

感谢所有为本项目做出贡献的开发者！

- [@longzheng268](https://github.com/longzheng268) - 项目创建者

---

**[查看完整历史记录](https://github.com/longzheng268/proxygithub/commits/main)**
