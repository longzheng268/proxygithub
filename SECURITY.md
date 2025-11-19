# 安全配置指南 / Security Configuration Guide

本文档介绍 ProxyGitHub 的安全功能配置，包括 IP 地理位置限制和速率限制。

This document describes the security features of ProxyGitHub, including IP geolocation restrictions and rate limiting.

---

## 📋 目录 / Table of Contents

- [IP 地理位置限制](#ip-地理位置限制)
- [速率限制](#速率限制)
- [配置示例](#配置示例)
- [故障排除](#故障排除)

---

## 🌍 IP 地理位置限制 / IP Geolocation Restrictions

### 功能说明 / Description

IP 地理位置限制功能允许您根据访问者的国家/地区来控制访问权限。这对于：

The IP geolocation restriction feature allows you to control access based on visitors' countries/regions. This is useful for:

1. **防止滥用** - 限制特定地区的访问以减少滥用投诉
2. **合规要求** - 满足某些地区的法律法规要求
3. **资源保护** - 将服务限制在特定地理区域以节省带宽

1. **Preventing Abuse** - Restrict access from specific regions to reduce abuse complaints
2. **Compliance** - Meet legal requirements in certain regions
3. **Resource Protection** - Limit service to specific geographic regions to save bandwidth

### 工作原理 / How It Works

该功能使用 Cloudflare 提供的 `CF-IPCountry` HTTP 头部来识别访问者的国家代码（ISO 3166-1 alpha-2 格式）。

The feature uses the `CF-IPCountry` HTTP header provided by Cloudflare to identify the visitor's country code (ISO 3166-1 alpha-2 format).

### 配置参数 / Configuration Parameters

#### 1. 启用地理位置限制 / Enable Geolocation Restrictions

```bash
# 环境变量 / Environment Variable
GEO_RESTRICTION_ENABLED=true
```

#### 2. 选择模式 / Choose Mode

支持两种模式 / Two modes are supported:

- **whitelist（白名单）**: 只允许指定国家访问
- **blacklist（黑名单）**: 阻止指定国家访问

```bash
# 白名单模式（推荐用于限制国内访问）
GEO_RESTRICTION_MODE=whitelist

# 黑名单模式
GEO_RESTRICTION_MODE=blacklist
```

#### 3. 配置国家列表 / Configure Country List

使用 ISO 3166-1 alpha-2 国家代码，多个国家用逗号分隔。

Use ISO 3166-1 alpha-2 country codes, separated by commas for multiple countries.

```bash
# 白名单模式：只允许中国大陆访问
ALLOWED_COUNTRIES=CN

# 白名单模式：允许中国和香港访问
ALLOWED_COUNTRIES=CN,HK

# 黑名单模式：阻止美国和英国访问
BLOCKED_COUNTRIES=US,GB
```

#### 常用国家代码 / Common Country Codes

| 国家/地区 | 代码 | Country/Region | Code |
|----------|------|----------------|------|
| 中国大陆 | CN   | Mainland China | CN   |
| 香港     | HK   | Hong Kong      | HK   |
| 台湾     | TW   | Taiwan         | TW   |
| 美国     | US   | United States  | US   |
| 英国     | GB   | United Kingdom | GB   |
| 日本     | JP   | Japan          | JP   |
| 韩国     | KR   | South Korea    | KR   |
| 新加坡   | SG   | Singapore      | SG   |

完整列表请参考：[ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)

For the complete list, see: [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)

### 被阻止时的响应 / Response When Blocked

当访问被阻止时，用户会看到一个友好的错误页面，包含：

When access is blocked, users will see a friendly error page containing:

- HTTP 状态码 403 (Forbidden)
- 访问被阻止的原因
- 用户的国家代码
- 联系管理员的提示

---

## ⚡ 速率限制 / Rate Limiting

### 功能说明 / Description

速率限制功能防止单个 IP 地址在短时间内发起过多请求，有助于：

Rate limiting prevents a single IP address from making too many requests in a short time, helping to:

1. **防止 DDoS 攻击** - 缓解分布式拒绝服务攻击
2. **避免 429 错误** - 减少上游 API 的速率限制问题
3. **公平使用** - 确保资源在所有用户之间公平分配
4. **降低成本** - 减少 Cloudflare Workers 的请求计数

1. **Prevent DDoS** - Mitigate distributed denial of service attacks
2. **Avoid 429 Errors** - Reduce upstream API rate limit issues
3. **Fair Usage** - Ensure resources are fairly distributed among all users
4. **Reduce Costs** - Lower Cloudflare Workers request counts

### 工作原理 / How It Works

系统会跟踪每个 IP 地址在时间窗口内的请求数量。超过限制后，会返回 HTTP 429 状态码。

The system tracks the number of requests from each IP address within a time window. After exceeding the limit, it returns HTTP 429 status code.

**注意 / Note**: 当前实现使用内存存储，在 Cloudflare Workers 中每个请求都是独立的实例。对于生产环境，建议使用 Cloudflare KV 或 Durable Objects 来实现持久化的速率限制。

The current implementation uses in-memory storage, where each request in Cloudflare Workers runs in an independent instance. For production, consider using Cloudflare KV or Durable Objects for persistent rate limiting.

### 配置参数 / Configuration Parameters

#### 1. 启用速率限制 / Enable Rate Limiting

```bash
# 环境变量 / Environment Variable
RATE_LIMIT_ENABLED=true
```

#### 2. 设置请求限制 / Set Request Limit

```bash
# 每分钟允许的请求数（默认：60）
RATE_LIMIT_PER_MINUTE=60

# 示例：更严格的限制
RATE_LIMIT_PER_MINUTE=30

# 示例：更宽松的限制
RATE_LIMIT_PER_MINUTE=120
```

### 响应头部 / Response Headers

速率限制响应包含以下头部信息：

Rate limit responses include the following headers:

```
X-RateLimit-Limit: 60          # 每分钟最大请求数
X-RateLimit-Remaining: 45      # 剩余可用请求数
X-RateLimit-Reset: 1699999999  # 限制重置的时间戳
Retry-After: 15                # 建议重试的秒数
```

---

## 📝 配置示例 / Configuration Examples

### 示例 1: 仅限中国大陆访问 / Example 1: China Mainland Only

适用场景：为国内用户提供服务，防止海外滥用。

Use case: Serve domestic users only, prevent overseas abuse.

**使用 Wrangler CLI:**

```bash
# 1. 设置环境变量
wrangler secret put GEO_RESTRICTION_ENABLED
# 输入: true

wrangler secret put GEO_RESTRICTION_MODE
# 输入: whitelist

wrangler secret put ALLOWED_COUNTRIES
# 输入: CN

# 2. 部署
wrangler deploy
```

**或在 wrangler.toml 中配置:**

```toml
[vars]
GEO_RESTRICTION_ENABLED = "true"
GEO_RESTRICTION_MODE = "whitelist"
ALLOWED_COUNTRIES = "CN"
```

### 示例 2: 启用速率限制 / Example 2: Enable Rate Limiting

适用场景：防止单个用户过度使用服务。

Use case: Prevent individual users from overusing the service.

```bash
wrangler secret put RATE_LIMIT_ENABLED
# 输入: true

wrangler secret put RATE_LIMIT_PER_MINUTE
# 输入: 60

wrangler deploy
```

### 示例 3: 组合配置 / Example 3: Combined Configuration

同时启用地理位置限制和速率限制：

Enable both geolocation restrictions and rate limiting:

```toml
[vars]
# IP 地理位置限制
GEO_RESTRICTION_ENABLED = "true"
GEO_RESTRICTION_MODE = "whitelist"
ALLOWED_COUNTRIES = "CN,HK,TW"

# 速率限制
RATE_LIMIT_ENABLED = "true"
RATE_LIMIT_PER_MINUTE = "60"
```

### 示例 4: 黑名单模式 / Example 4: Blacklist Mode

阻止特定国家，允许其他所有国家：

Block specific countries, allow all others:

```toml
[vars]
GEO_RESTRICTION_ENABLED = "true"
GEO_RESTRICTION_MODE = "blacklist"
BLOCKED_COUNTRIES = "US,GB,FR,DE"
```

---

## 🔧 故障排除 / Troubleshooting

### 问题 1: 配置不生效 / Issue 1: Configuration Not Working

**症状 / Symptom**: 设置了环境变量但限制没有生效

**解决方案 / Solution**:

1. 确认环境变量格式正确，使用字符串 "true" 而不是布尔值
2. 重新部署 Worker: `wrangler deploy`
3. 清除浏览器缓存并重试
4. 检查 Cloudflare Dashboard 中的环境变量设置

```bash
# 验证部署
wrangler tail --format pretty
```

### 问题 2: 速率限制不准确 / Issue 2: Inaccurate Rate Limiting

**症状 / Symptom**: 速率限制计数不准确或重置

**原因 / Cause**: 
当前实现使用内存存储，Cloudflare Workers 的无状态特性可能导致计数不一致。

The current implementation uses in-memory storage; Cloudflare Workers' stateless nature may cause inconsistent counting.

**解决方案 / Solution**:
对于生产环境，建议使用以下方案之一：

For production, consider one of the following solutions:

1. **Cloudflare KV** - 持久化键值存储
2. **Durable Objects** - 有状态的 Workers（需要付费计划）
3. **外部 Redis** - 使用外部 Redis 服务

### 问题 3: 无法获取国家代码 / Issue 3: Cannot Get Country Code

**症状 / Symptom**: `CF-IPCountry` 头部显示 "UNKNOWN"

**可能原因 / Possible Causes**:

1. 在本地开发环境测试（`wrangler dev`）- CF 头部仅在生产环境可用
2. IP 地址在 Cloudflare 数据库中未知
3. 使用 VPN 或代理

**解决方案 / Solution**:

1. 部署到 Cloudflare Workers 进行测试
2. 检查请求头部: `curl -I https://your-worker.workers.dev`

### 问题 4: 合法用户被阻止 / Issue 4: Legitimate Users Blocked

**症状 / Symptom**: 合法用户报告无法访问服务

**解决方案 / Solution**:

1. 检查白名单配置是否包含用户所在国家
2. 考虑使用黑名单模式代替白名单模式
3. 提供绕过机制（例如：特殊的访问令牌）
4. 调整速率限制阈值

---

## 🔐 安全建议 / Security Best Practices

1. **谨慎使用白名单模式** - 可能会阻止合法的国际用户
2. **监控日志** - 使用 `wrangler tail` 监控被阻止的请求
3. **合理设置速率限制** - 避免过于严格影响正常使用
4. **定期审查配置** - 根据使用情况调整安全策略
5. **提供用户反馈** - 在被阻止页面提供联系方式

1. **Use Whitelist Carefully** - May block legitimate international users
2. **Monitor Logs** - Use `wrangler tail` to monitor blocked requests
3. **Set Reasonable Rate Limits** - Avoid being too strict and affecting normal usage
4. **Regularly Review Configuration** - Adjust security policies based on usage
5. **Provide User Feedback** - Provide contact information on blocked pages

---

## 📞 支持 / Support

如果遇到问题或有建议，请：

If you encounter issues or have suggestions:

- 提交 Issue: [GitHub Issues](https://github.com/longzheng268/proxygithub/issues)
- 参与讨论: [GitHub Discussions](https://github.com/longzheng268/proxygithub/discussions)

---

## 📚 相关文档 / Related Documentation

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare KV 文档](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [ISO 3166-1 国家代码](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)

---

**最后更新 / Last Updated**: 2024-11-19
