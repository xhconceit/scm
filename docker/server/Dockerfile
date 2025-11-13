# 多阶段构建 - 构建阶段
FROM node:18-alpine AS builder

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制 workspace 配置文件
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

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

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制 workspace 配置文件
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# 复制 server 的 package.json
COPY apps/server/package.json ./apps/server/

# 复制 packages（如果有共享代码）
COPY packages ./packages

# 只安装生产依赖
RUN pnpm install --prod --frozen-lockfile --filter @scm/server

# 从构建阶段复制编译后的代码
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/node_modules/.prisma ./apps/server/node_modules/.prisma

# 复制 Prisma schema（用于运行迁移）
COPY apps/server/prisma ./apps/server/prisma

WORKDIR /app/apps/server

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "dist/index.js"]

