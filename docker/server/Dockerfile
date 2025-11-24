# 多阶段构建 - 构建阶段
FROM node:18-alpine AS builder

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制 workspace 配置文件
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY tsconfig.json ./

# 复制所有需要的源代码
COPY apps/server ./apps/server
COPY packages ./packages

# 安装依赖
RUN pnpm install --frozen-lockfile

# 生成 Prisma 客户端
WORKDIR /app/apps/server
RUN pnpm prisma generate

# 构建应用
RUN pnpm build

# 生产阶段
FROM node:18-alpine AS production

# 安装依赖（包括 OpenSSL）
RUN apk add --no-cache openssl

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制 workspace 配置文件
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# 复制 packages（如果有共享代码）
COPY packages ./packages

# 从构建阶段复制所有必要的文件
COPY --from=builder /app/apps/server/package.json ./apps/server/
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=builder /app/apps/server/prisma ./apps/server/prisma
COPY --from=builder /app/node_modules ./node_modules

# 复制启动脚本
COPY docker/server/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /app/apps/server

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 使用启动脚本
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/index.js"]

