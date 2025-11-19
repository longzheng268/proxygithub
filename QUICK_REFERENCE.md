# 快速参考卡 / Quick Reference Card

## 配置命令速查表

### IP 地理位置限制 / IP Geolocation Restrictions

#### 启用并限制为中国 / Enable and Restrict to China
```bash
wrangler secret put GEO_RESTRICTION_ENABLED    # 输入: true
wrangler secret put GEO_RESTRICTION_MODE       # 输入: whitelist
wrangler secret put ALLOWED_COUNTRIES          # 输入: CN
wrangler deploy
```

#### 启用并限制为大中华地区 / Enable for Greater China
```bash
wrangler secret put GEO_RESTRICTION_ENABLED    # 输入: true
wrangler secret put GEO_RESTRICTION_MODE       # 输入: whitelist
wrangler secret put ALLOWED_COUNTRIES          # 输入: CN,HK,TW,MO
wrangler deploy
```

#### 阻止特定国家 / Block Specific Countries
```bash
wrangler secret put GEO_RESTRICTION_ENABLED    # 输入: true
wrangler secret put GEO_RESTRICTION_MODE       # 输入: blacklist
wrangler secret put BLOCKED_COUNTRIES          # 输入: US,GB
wrangler deploy
```

#### 禁用地理位置限制 / Disable Geo Restrictions
```bash
wrangler secret put GEO_RESTRICTION_ENABLED    # 输入: false
wrangler deploy
```

---

### 速率限制 / Rate Limiting

#### 启用速率限制（标准） / Enable Rate Limiting (Standard)
```bash
wrangler secret put RATE_LIMIT_ENABLED         # 输入: true
wrangler secret put RATE_LIMIT_PER_MINUTE      # 输入: 60
wrangler deploy
```

#### 严格限制 / Strict Limit
```bash
wrangler secret put RATE_LIMIT_ENABLED         # 输入: true
wrangler secret put RATE_LIMIT_PER_MINUTE      # 输入: 30
wrangler deploy
```

#### 宽松限制 / Relaxed Limit
```bash
wrangler secret put RATE_LIMIT_ENABLED         # 输入: true
wrangler secret put RATE_LIMIT_PER_MINUTE      # 输入: 120
wrangler deploy
```

#### 禁用速率限制 / Disable Rate Limiting
```bash
wrangler secret put RATE_LIMIT_ENABLED         # 输入: false
wrangler deploy
```

---

## 常用命令 / Common Commands

### 部署 / Deploy
```bash
wrangler deploy
```

### 查看日志 / View Logs
```bash
wrangler tail --format pretty
```

### 查看部署历史 / View Deployment History
```bash
wrangler deployments list
```

### 查看配置 / View Configuration
在 Cloudflare Dashboard 查看:
https://dash.cloudflare.com/ → Workers & Pages → [你的 Worker] → Settings → Variables

---

## 测试命令 / Test Commands

### 测试访问 / Test Access
```bash
curl -I https://your-worker.workers.dev/
```

### 测试速率限制 / Test Rate Limiting
```bash
for i in {1..65}; do curl -I https://your-worker.workers.dev/ 2>&1 | grep "HTTP"; done
```

### 使用 VPN 测试地理限制 / Test Geo Restrictions with VPN
1. 连接到美国 VPN
2. 访问你的 Worker
3. 应该看到 403 Forbidden（如果启用了中国白名单）

---

## 环境变量参考 / Environment Variables Reference

| 变量名 | 值示例 | 说明 |
|--------|--------|------|
| `GEO_RESTRICTION_ENABLED` | `true` 或 `false` | 启用/禁用地理位置限制 |
| `GEO_RESTRICTION_MODE` | `whitelist` 或 `blacklist` | 白名单或黑名单模式 |
| `ALLOWED_COUNTRIES` | `CN` 或 `CN,HK,TW` | 白名单国家列表（逗号分隔） |
| `BLOCKED_COUNTRIES` | `US,GB` | 黑名单国家列表（逗号分隔） |
| `RATE_LIMIT_ENABLED` | `true` 或 `false` | 启用/禁用速率限制 |
| `RATE_LIMIT_PER_MINUTE` | `60` | 每分钟最大请求数 |

---

## 常见国家代码 / Common Country Codes

| 国家/地区 | 代码 |
|----------|------|
| 中国大陆 | CN |
| 香港 | HK |
| 澳门 | MO |
| 台湾 | TW |
| 美国 | US |
| 英国 | GB |
| 日本 | JP |
| 韩国 | KR |
| 新加坡 | SG |
| 加拿大 | CA |
| 澳大利亚 | AU |
| 德国 | DE |
| 法国 | FR |

完整列表: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2

---

## 响应状态码 / Response Status Codes

| 状态码 | 说明 |
|--------|------|
| `200` | 成功 / Success |
| `403` | IP 被地理位置限制阻止 / Blocked by geo restrictions |
| `429` | 超过速率限制 / Rate limit exceeded |
| `502` | 代理错误 / Proxy error |

---

## 预设配置方案 / Preset Configurations

### 方案 1: 国内专用（最严格）
**适用**: 防止国外扫描和滥用

```bash
GEO_RESTRICTION_ENABLED=true
GEO_RESTRICTION_MODE=whitelist
ALLOWED_COUNTRIES=CN
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=30
```

### 方案 2: 亚太地区（平衡）
**适用**: 服务亚太用户

```bash
GEO_RESTRICTION_ENABLED=true
GEO_RESTRICTION_MODE=whitelist
ALLOWED_COUNTRIES=CN,HK,TW,JP,KR,SG
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=60
```

### 方案 3: 阻止已知滥用地区（宽松）
**适用**: 保持开放但阻止问题来源

```bash
GEO_RESTRICTION_ENABLED=true
GEO_RESTRICTION_MODE=blacklist
BLOCKED_COUNTRIES=US,GB
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=120
```

### 方案 4: 仅速率限制（开放）
**适用**: 全球访问但有速率保护

```bash
GEO_RESTRICTION_ENABLED=false
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=60
```

### 方案 5: 完全开放（默认）
**适用**: 测试环境或无限制需求

```bash
GEO_RESTRICTION_ENABLED=false
RATE_LIMIT_ENABLED=false
```

---

## 监控和维护 / Monitoring & Maintenance

### 每日检查 / Daily Checks
```bash
# 查看请求统计
wrangler tail --format pretty | grep -E "(Geo-blocked|Rate-limited)"
```

### 每周审查 / Weekly Review
1. 登录 Cloudflare Dashboard
2. 查看 Workers 指标
3. 检查错误率和被阻止的请求
4. 根据需要调整配置

### 每月优化 / Monthly Optimization
1. 分析流量模式
2. 调整速率限制阈值
3. 更新地理位置白名单/黑名单
4. 检查是否有新的滥用来源

---

## 故障排除清单 / Troubleshooting Checklist

- [ ] 确认环境变量正确设置（Dashboard → Settings → Variables）
- [ ] 确认已重新部署（`wrangler deploy`）
- [ ] 清除浏览器缓存
- [ ] 查看实时日志（`wrangler tail`）
- [ ] 检查 CF-IPCountry 头部是否可用（生产环境）
- [ ] 验证国家代码格式正确（大写，ISO 3166-1 alpha-2）
- [ ] 确认值为字符串 "true"/"false" 而非布尔值

---

## 获取帮助 / Get Help

- 📖 详细文档: [SECURITY.md](SECURITY.md)
- 🚀 部署指南: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- 📚 完整说明: [README.md](README.md)
- 🐛 报告问题: https://github.com/longzheng268/proxygithub/issues
- 💬 讨论区: https://github.com/longzheng268/proxygithub/discussions

---

**提示**: 保存此文件到本地以便快速查阅配置命令！
