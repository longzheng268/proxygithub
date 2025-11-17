# ProxyGitHub Dockerfile
# 多阶段构建，优化镜像大小

# 构建阶段
FROM node:18-alpine AS builder

LABEL maintainer="longzheng268"
LABEL description="GitHub & Docker Hub Acceleration Proxy"

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖（仅生产环境）
RUN npm ci --only=production && \
    npm install -g wrangler@latest && \
    npm cache clean --force

# 运行阶段
FROM node:18-alpine

WORKDIR /app

# 安装必要的运行时依赖
RUN apk add --no-cache tini curl

# 从构建阶段复制依赖
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /usr/local/lib/node_modules/wrangler /usr/local/lib/node_modules/wrangler
RUN ln -s /usr/local/lib/node_modules/wrangler/bin/wrangler.js /usr/local/bin/wrangler

# 复制应用文件
COPY worker.js ./
COPY wrangler.toml ./
COPY server.js ./
COPY package*.json ./

# 创建非 root 用户
RUN addgroup -g 1000 proxygithub && \
    adduser -D -u 1000 -G proxygithub proxygithub && \
    chown -R proxygithub:proxygithub /app

# 切换到非 root 用户
USER proxygithub

# 暴露端口
EXPOSE 8787

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8787/ || exit 1

# 使用 tini 作为 init 系统
ENTRYPOINT ["/sbin/tini", "--"]

# 默认使用 Node.js 服务器（更稳定）
# 可以通过环境变量 USE_WRANGLER=true 切换到 wrangler
CMD ["node", "server.js"]

# 使用 wrangler 的替代命令：
# CMD ["wrangler", "dev", "--local", "--port", "8787", "--no-update-check"]
