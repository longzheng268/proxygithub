# 贡献指南 / Contributing Guide

感谢你对 ProxyGitHub 项目的关注！我们欢迎所有形式的贡献。

---

## 如何贡献 / How to Contribute

### 报告问题 / Reporting Issues

如果你发现了 bug 或有功能建议：

1. 查看 [现有 Issues](https://github.com/longzheng268/proxygithub/issues) 避免重复
2. 创建新 Issue，详细描述：
   - 问题现象或功能需求
   - 复现步骤（如果是 bug）
   - 期望行为
   - 环境信息（浏览器、系统等）

### 提交代码 / Submitting Code

#### 1. Fork 项目

点击右上角的 "Fork" 按钮，复制项目到你的账号下。

#### 2. 克隆仓库

```bash
git clone https://github.com/你的用户名/proxygithub.git
cd proxygithub
```

#### 3. 创建分支

```bash
# 功能分支
git checkout -b feature/your-feature-name

# 修复分支
git checkout -b fix/your-bug-fix
```

#### 4. 进行修改

- 保持代码风格一致
- 添加必要的注释
- 确保模块化设计原则
- 测试你的修改

#### 5. 提交更改

```bash
git add .
git commit -m "feat: 添加某功能" 
# 或
git commit -m "fix: 修复某问题"
```

**提交信息格式：**
- `feat:` 新功能
- `fix:` 修复问题
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具相关

#### 6. 推送到 GitHub

```bash
git push origin feature/your-feature-name
```

#### 7. 创建 Pull Request

1. 访问你的 Fork 仓库页面
2. 点击 "Pull Request" 按钮
3. 填写 PR 描述：
   - 修改内容说明
   - 相关 Issue 编号
   - 测试结果

---

## 开发指南 / Development Guide

### 本地开发

```bash
# 安装依赖
npm install

# 本地运行
npm run dev
# 或
wrangler dev

# 访问 http://localhost:8787
```

### 测试

```bash
# GitHub 代理测试
curl http://localhost:8787/https://api.github.com/repos/longzheng268/proxygithub

# Docker 代理测试
curl http://localhost:8787/v2/
```

### 代码规范

- **模块化设计**：新功能应该是独立模块，不影响现有功能
- **错误处理**：所有模块必须有 try-catch 错误处理
- **注释**：关键逻辑必须添加中英文注释
- **兼容性**：确保 Git Clone 等核心功能正常

### 项目结构

```
proxygithub/
├── worker.js           # 主入口文件（模块化设计）
├── wrangler.toml       # Cloudflare Workers 配置
├── package.json        # 项目配置
├── README.md           # 项目文档
├── CHANGELOG.md        # 更新日志
├── CONTRIBUTING.md     # 本文件
└── LICENSE             # 许可证
```

### 模块划分

1. **配置模块** - CONFIG 对象
2. **路由模块** - handleRequest()
3. **GitHub 代理模块** - handleGitHubProxy()
4. **Docker 代理模块** - handleDockerProxy()
5. **UI 渲染模块** - renderHomePage(), nginx(), searchInterface()
6. **工具函数模块** - 各种辅助函数

**重要原则**：确保模块间低耦合，单个模块失败不影响其他功能。

---

## 代码审查 / Code Review

所有 PR 都会经过审查：

- ✅ 代码风格是否一致
- ✅ 是否遵循模块化设计
- ✅ 是否有适当的错误处理
- ✅ 是否影响现有功能
- ✅ 文档是否更新

---

## 发布流程 / Release Process

1. 更新 `CHANGELOG.md`
2. 更新 `package.json` 版本号
3. 创建 Git Tag
4. 发布 GitHub Release
5. 部署到生产环境

---

## 行为准则 / Code of Conduct

- 尊重所有贡献者
- 保持友善和专业
- 接受建设性批评
- 关注项目最佳利益

---

## 许可证 / License

通过贡献代码，你同意你的贡献将使用与本项目相同的许可证。

---

## 需要帮助？/ Need Help?

- 💬 [GitHub Discussions](https://github.com/longzheng268/proxygithub/discussions)
- 📮 [提交 Issue](https://github.com/longzheng268/proxygithub/issues)

---

**再次感谢你的贡献！ / Thank you for contributing!** 🎉
