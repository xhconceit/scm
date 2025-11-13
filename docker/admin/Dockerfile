# 多阶段构建 - 构建阶段
FROM node:18-alpine AS builder

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制 workspace 配置文件
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# 复制所有需要的源代码
COPY apps/admin ./apps/admin
COPY packages ./packages

# 安装依赖
RUN pnpm install --frozen-lockfile

# 构建应用
WORKDIR /app/apps/admin
RUN pnpm build

# 生产阶段 - 使用 Nginx 提供静态文件服务
FROM nginx:alpine AS production

# 复制自定义 Nginx 配置
COPY docker/admin/nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物到 Nginx 服务目录
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Nginx 会自动启动
CMD ["nginx", "-g", "daemon off;"]

