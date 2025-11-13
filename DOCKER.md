# Docker 部署指南

本文档提供 SCM 项目的 Docker 部署详细指南。

## 📋 目录

- [快速开始](#快速开始)
- [部署方式](#部署方式)
- [环境配置](#环境配置)
- [常用命令](#常用命令)
- [故障排查](#故障排查)
- [最佳实践](#最佳实践)

## 🚀 快速开始

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- Make（可选，用于便捷命令）

### 一键部署

```bash
# 使用 Makefile（推荐）
make prod-up

# 或使用 Docker Compose
docker-compose -f docker/docker-compose.yml build
docker-compose -f docker/docker-compose.yml up -d
```

访问应用：
- **前端**: http://localhost:8080
- **API**: http://localhost:3000
- **MQTT Dashboard**: http://localhost:18083 (admin/public)

## 📦 部署方式

### 方式一：生产环境完整部署

部署所有服务（数据库、MQTT、后端、前端）：

```bash
# 使用 Makefile
make prod-up

# 使用脚本
./scripts/docker-prod.sh

# 使用 Docker Compose
docker-compose build
docker-compose up -d
```

### 方式二：开发环境部署

仅启动基础服务（数据库、MQTT），应用在本地运行：

```bash
# 启动基础服务
make dev-up
# 或
./scripts/docker-dev.sh

# 本地运行应用
pnpm install
pnpm dev
```

## ⚙️ 环境配置

### 修改配置

编辑 `docker/docker-compose.yml` 中的环境变量：

```yaml
services:
  server:
    environment:
      # MQTT 配置
      MQTT_BROKER: mqtt://mqtt
      MQTT_PORT: 1883
      MQTT_USERNAME: ""          # 修改为你的用户名
      MQTT_PASSWORD: ""          # 修改为你的密码
      
      # 数据库配置
      DATABASE_URL: postgresql://scmuser:scmpassword@postgres:5432/scm
      
      # 服务配置
      PORT: 3000
      NODE_ENV: production
```

### 修改端口

如果默认端口冲突，可以在 `docker/docker-compose.yml` 中修改：

```yaml
services:
  admin:
    ports:
      - "8080:80"    # 改为 "9000:80"
      
  server:
    ports:
      - "3000:3000"  # 改为 "4000:3000"
      
  postgres:
    ports:
      - "5432:5432"  # 改为 "5433:5432"
```

### 数据库凭证

生产环境请修改默认密码：

```yaml
services:
  postgres:
    environment:
      POSTGRES_DB: scm
      POSTGRES_USER: scmuser
      POSTGRES_PASSWORD: your_secure_password  # 修改这里
      
  server:
    environment:
      DATABASE_URL: postgresql://scmuser:your_secure_password@postgres:5432/scm
```

## 🛠️ 常用命令

### Makefile 命令（推荐）

```bash
# 查看帮助
make help

# 开发环境
make dev-up          # 启动开发环境基础服务
make dev-down        # 停止开发环境

# 生产环境
make prod-up         # 启动生产环境
make prod-down       # 停止生产环境

# 日志查看
make logs            # 所有服务日志
make logs-server     # Server 日志
make logs-admin      # Admin 日志
make logs-mqtt       # MQTT 日志
make logs-db         # 数据库日志

# 服务管理
make ps              # 查看服务状态
make restart         # 重启所有服务
make restart-server  # 重启 Server
make restart-admin   # 重启 Admin

# 数据库操作
make db-migrate      # 执行数据库迁移
make db-studio       # 启动 Prisma Studio

# 进入容器
make shell-server    # 进入 Server 容器
make shell-admin     # 进入 Admin 容器
make shell-db        # 连接数据库

# 清理
make clean           # 清理容器和数据卷
```

### Docker Compose 原生命令

所有命令需要指定配置文件路径：`-f docker/docker-compose.yml`

```bash
# 构建和启动
docker-compose -f docker/docker-compose.yml build                    # 构建镜像
docker-compose -f docker/docker-compose.yml build --no-cache        # 重新构建（不使用缓存）
docker-compose -f docker/docker-compose.yml up -d                    # 后台启动
docker-compose -f docker/docker-compose.yml up                       # 前台启动（查看日志）

# 查看状态
docker-compose -f docker/docker-compose.yml ps                       # 服务状态
docker-compose -f docker/docker-compose.yml logs                     # 所有日志
docker-compose -f docker/docker-compose.yml logs -f server          # 跟踪 server 日志
docker-compose -f docker/docker-compose.yml logs --tail=100 server  # 查看最后 100 行

# 服务管理
docker-compose -f docker/docker-compose.yml stop                     # 停止服务
docker-compose -f docker/docker-compose.yml start                    # 启动服务
docker-compose -f docker/docker-compose.yml restart                  # 重启服务
docker-compose -f docker/docker-compose.yml restart server          # 重启特定服务

# 清理
docker-compose -f docker/docker-compose.yml down                     # 停止并删除容器
docker-compose -f docker/docker-compose.yml down -v                  # 停止并删除容器和数据卷
```

### Docker 原生命令

```bash
# 查看容器
docker ps                              # 运行中的容器
docker ps -a                           # 所有容器

# 查看日志
docker logs scm-server                 # 查看 server 日志
docker logs -f scm-server              # 跟踪日志
docker logs --tail=100 scm-server      # 最后 100 行

# 进入容器
docker exec -it scm-server sh          # 进入 server 容器
docker exec -it scm-admin sh           # 进入 admin 容器
docker exec -it scm-postgres psql -U scmuser -d scm  # 连接数据库

# 查看资源使用
docker stats                           # 实时资源监控
docker system df                       # 磁盘使用情况
```

## 🔧 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker-compose -f docker/docker-compose.yml logs

# 查看特定服务日志
docker-compose -f docker/docker-compose.yml logs server

# 检查容器状态
docker-compose -f docker/docker-compose.yml ps

# 重新构建
docker-compose -f docker/docker-compose.yml down
docker-compose -f docker/docker-compose.yml build --no-cache
docker-compose -f docker/docker-compose.yml up -d
```

### 数据库连接失败

```bash
# 检查 PostgreSQL 是否健康
docker-compose -f docker/docker-compose.yml ps postgres

# 查看数据库日志
docker-compose -f docker/docker-compose.yml logs postgres

# 测试数据库连接
docker exec -it scm-postgres psql -U scmuser -d scm

# 重启数据库
docker-compose -f docker/docker-compose.yml restart postgres
```

### 端口冲突

```bash
# 查看端口占用
lsof -i :3000
lsof -i :8080
lsof -i :5432

# 修改 docker/docker-compose.yml 中的端口映射
# 例如: "9000:80" 替代 "8080:80"
```

### MQTT 连接问题

```bash
# 检查 MQTT 服务状态
docker-compose -f docker/docker-compose.yml logs mqtt

# 访问 EMQX Dashboard
open http://localhost:18083

# 重启 MQTT 服务
docker-compose -f docker/docker-compose.yml restart mqtt
```

### 磁盘空间不足

```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune

# 清理未使用的卷
docker volume prune

# 清理所有未使用资源
docker system prune -a --volumes
```

## 📊 监控和维护

### 查看资源使用

```bash
# 实时监控
docker stats

# 查看磁盘使用
docker system df

# 查看容器详情
docker inspect scm-server
```

### 备份数据

```bash
# 备份数据库
docker exec scm-postgres pg_dump -U scmuser scm > backup.sql

# 恢复数据库
cat backup.sql | docker exec -i scm-postgres psql -U scmuser -d scm

# 备份数据卷
docker run --rm -v scm_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

### 更新应用

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建镜像
docker-compose -f docker/docker-compose.yml build

# 3. 重启服务
docker-compose -f docker/docker-compose.yml up -d

# 4. 执行数据库迁移（如果需要）
docker exec -it scm-server sh -c "pnpm prisma migrate deploy"
```

## 🎯 最佳实践

### 开发流程

1. 使用 `make dev-up` 启动基础服务
2. 本地运行 `pnpm dev` 进行开发
3. 修改代码后自动热重载
4. 使用 `make dev-down` 停止服务

### 生产部署

1. 修改 `docker-compose.yml` 中的密码和配置
2. 使用 `make prod-up` 部署
3. 使用 `make logs` 检查日志
4. 配置反向代理（Nginx/Caddy）处理 HTTPS

### 安全建议

1. ✅ 修改默认密码
2. ✅ 使用环境变量管理敏感信息
3. ✅ 定期备份数据库
4. ✅ 限制暴露的端口
5. ✅ 使用 HTTPS
6. ✅ 定期更新镜像

### 性能优化

1. 使用 Docker 多阶段构建减少镜像大小
2. 启用 Gzip 压缩（已在 nginx.conf 中配置）
3. 配置适当的资源限制
4. 使用 Docker 卷提高 I/O 性能

### CI/CD 集成

```yaml
# .github/workflows/docker.yml 示例
name: Docker Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build images
        run: docker-compose -f docker/docker-compose.yml build
      - name: Run tests
        run: docker-compose -f docker/docker-compose.yml run --rm server pnpm test
```

## 📚 相关资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [EMQX 文档](https://www.emqx.io/docs/)
- [PostgreSQL Docker 镜像](https://hub.docker.com/_/postgres)
- [Nginx Docker 镜像](https://hub.docker.com/_/nginx)

## 🆘 获取帮助

如遇到问题：

1. 查看日志：`make logs`
2. 检查服务状态：`make ps`
3. 查看本文档的故障排查部分
4. 提交 Issue 到项目仓库

---

**祝部署顺利！** 🚀

