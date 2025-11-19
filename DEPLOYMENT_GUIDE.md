# 部署指南 - IP 地理位置限制和速率限制功能

## 快速开始

本文档提供了如何部署和配置新的安全功能的完整指南。

### 功能概述

1. **IP 地理位置限制**: 根据访问者的国家/地区限制访问
2. **速率限制**: 防止单个 IP 在短时间内发起过多请求

## 部署步骤

### 方法 1: 使用 Wrangler CLI（推荐）

#### 1. 部署到 Cloudflare Workers

```bash
# 如果还没有安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署 Worker
wrangler deploy
```

#### 2. 配置 IP 地理位置限制（仅允许中国大陆访问）

```bash
# 启用地理位置限制
wrangler secret put GEO_RESTRICTION_ENABLED
# 输入: true

# 设置为白名单模式
wrangler secret put GEO_RESTRICTION_MODE
# 输入: whitelist

# 设置允许的国家（中国）
wrangler secret put ALLOWED_COUNTRIES
# 输入: CN

# 重新部署使配置生效
wrangler deploy
```

#### 3. 配置速率限制

```bash
# 启用速率限制
wrangler secret put RATE_LIMIT_ENABLED
# 输入: true

# 设置每分钟最大请求数
wrangler secret put RATE_LIMIT_PER_MINUTE
# 输入: 60

# 重新部署使配置生效
wrangler deploy
```

### 方法 2: 使用 Cloudflare Dashboard

#### 1. 登录 Cloudflare Dashboard

访问 https://dash.cloudflare.com/

#### 2. 进入 Workers 设置

1. 点击左侧菜单 `Workers & Pages`
2. 找到你的 Worker（例如：proxygithub）
3. 点击进入 Worker 详情页

#### 3. 配置环境变量

1. 点击 `Settings` 标签
2. 找到 `Variables` 部分
3. 点击 `Add variable` 按钮

添加以下变量：

**IP 地理位置限制配置:**

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `GEO_RESTRICTION_ENABLED` | `true` | 启用地理位置限制 |
| `GEO_RESTRICTION_MODE` | `whitelist` | 使用白名单模式 |
| `ALLOWED_COUNTRIES` | `CN` | 只允许中国访问 |

**速率限制配置:**

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `RATE_LIMIT_ENABLED` | `true` | 启用速率限制 |
| `RATE_LIMIT_PER_MINUTE` | `60` | 每分钟最多 60 个请求 |

#### 4. 保存并部署

点击 `Save and Deploy` 按钮使配置生效。

## 验证配置

### 1. 检查环境变量

```bash
# 使用 Wrangler 检查配置
wrangler deployments list
```

### 2. 测试地理位置限制

**从中国访问（应该成功）:**
```bash
curl -I https://your-worker.workers.dev/
# 应该返回 200 OK
```

**从其他国家访问（应该被阻止）:**

使用 VPN 或代理从美国访问，应该会看到 403 Forbidden 响应。

### 3. 测试速率限制

```bash
# 快速发送多个请求
for i in {1..65}; do
  echo "Request $i:"
  curl -I https://your-worker.workers.dev/ 2>&1 | grep "HTTP"
done
```

前 60 个请求应该成功（200 OK），之后的请求应该返回 429 Too Many Requests。

## 监控和日志

### 查看实时日志

```bash
# 使用 Wrangler 查看实时日志
wrangler tail --format pretty
```

你会看到类似以下的日志：

```
Geo-blocked request from US: Country US not in whitelist
Rate-limited request from 1.2.3.4
```

### 使用 Cloudflare Dashboard 监控

1. 进入 Worker 详情页
2. 点击 `Metrics` 标签
3. 查看请求统计和错误率

## 常见配置场景

### 场景 1: 只允许中国大陆和香港

```bash
wrangler secret put ALLOWED_COUNTRIES
# 输入: CN,HK
```

### 场景 2: 阻止特定国家，允许其他所有国家

```bash
wrangler secret put GEO_RESTRICTION_MODE
# 输入: blacklist

wrangler secret put BLOCKED_COUNTRIES
# 输入: US,GB,FR,DE
```

### 场景 3: 更严格的速率限制

```bash
wrangler secret put RATE_LIMIT_PER_MINUTE
# 输入: 30
```

### 场景 4: 更宽松的速率限制

```bash
wrangler secret put RATE_LIMIT_PER_MINUTE
# 输入: 120
```

### 场景 5: 临时禁用所有限制

```bash
wrangler secret put GEO_RESTRICTION_ENABLED
# 输入: false

wrangler secret put RATE_LIMIT_ENABLED
# 输入: false

wrangler deploy
```

## 故障排除

### 问题 1: 配置后仍然可以从国外访问

**原因**: 可能是环境变量没有正确设置或部署没有生效。

**解决方案**:
1. 确认环境变量已正确设置: 在 Dashboard 的 Variables 部分检查
2. 确保值为字符串 "true" 而不是布尔值
3. 重新部署 Worker: `wrangler deploy`
4. 清除浏览器缓存

### 问题 2: 中国用户也被阻止

**原因**: 可能是 `ALLOWED_COUNTRIES` 配置错误或白名单模式未启用。

**解决方案**:
1. 检查 `ALLOWED_COUNTRIES` 是否包含 `CN`
2. 确认 `GEO_RESTRICTION_MODE` 设置为 `whitelist`
3. 查看日志确认国家代码: `wrangler tail`

### 问题 3: 速率限制不准确

**原因**: 当前实现使用内存存储，Cloudflare Workers 的无状态特性可能导致不一致。

**说明**: 
这是已知限制。对于生产环境，建议使用 Cloudflare KV 或 Durable Objects 实现持久化存储。

**临时解决方案**:
- 设置更保守的限制值
- 监控日志了解实际行为

### 问题 4: 无法获取国家代码

**原因**: 在本地开发环境，CF-IPCountry 头部不可用。

**解决方案**:
- 必须部署到 Cloudflare Workers 才能使用此功能
- 不要使用 `wrangler dev` 测试地理位置限制
- 部署后使用真实域名测试

## 性能影响

### 地理位置限制
- **CPU 开销**: 极低（简单的字符串比较）
- **延迟**: <1ms
- **内存**: 可忽略

### 速率限制
- **CPU 开销**: 低（Map 查找和简单计算）
- **延迟**: <2ms
- **内存**: 每个活动 IP 约 100 字节

**建议**: 两个功能对性能的影响都很小，可以放心启用。

## 最佳实践

1. **谨慎使用白名单模式**
   - 可能会阻止合法的国际用户
   - 考虑业务需求再决定

2. **设置合理的速率限制**
   - 不要设置太严格（例如 < 30/分钟）
   - 根据实际使用情况调整

3. **监控日志**
   - 定期检查被阻止的请求
   - 了解流量模式

4. **提供反馈渠道**
   - 在错误页面提供联系方式
   - 允许用户报告误封

5. **定期审查**
   - 每月检查一次配置
   - 根据统计数据优化

## 进阶配置

### 结合多个国家和地区

```bash
# 允许大中华地区
wrangler secret put ALLOWED_COUNTRIES
# 输入: CN,HK,MO,TW
```

### 针对不同环境使用不同配置

在 `wrangler.toml` 中:

```toml
[env.production]
name = "proxygithub-prod"
vars = { 
  GEO_RESTRICTION_ENABLED = "true",
  GEO_RESTRICTION_MODE = "whitelist",
  ALLOWED_COUNTRIES = "CN"
}

[env.staging]
name = "proxygithub-staging"
vars = { 
  GEO_RESTRICTION_ENABLED = "false"
}
```

部署到不同环境:

```bash
# 生产环境（启用限制）
wrangler deploy --env production

# 测试环境（禁用限制）
wrangler deploy --env staging
```

## 安全注意事项

1. **不要依赖客户端 IP**
   - IP 可以被伪造
   - 这只是第一道防线

2. **结合其他安全措施**
   - 使用 HTTPS
   - 实施身份验证（如果需要）
   - 启用 Cloudflare 的其他安全功能

3. **遵守法律法规**
   - 确保限制符合当地法律
   - 提供透明的使用条款

## 获取帮助

如果遇到问题：

1. 查看 [SECURITY.md](SECURITY.md) 获取详细文档
2. 查看 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
3. 提交 Issue: https://github.com/longzheng268/proxygithub/issues
4. 参与讨论: https://github.com/longzheng268/proxygithub/discussions

## 总结

通过正确配置 IP 地理位置限制和速率限制，你可以:

✅ 防止国外滥用和投诉  
✅ 减少 API 速率限制问题（HAP429）  
✅ 保护服务资源  
✅ 确保服务稳定性  

**记住**: 这些功能默认是禁用的，只有在你明确配置并启用后才会生效。

---

**最后更新**: 2024-11-19
**版本**: 2.0.0
