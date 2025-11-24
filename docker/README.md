# Docker 部署说明

此目录包含 SCM 项目的 Docker 部署配置。

## 📁 目录结构

```
docker/
├── admin/                          # Admin 前端镜像配置
│   ├── Dockerfile                 # Admin Dockerfile
│   └── nginx.conf                 # Nginx 配置
├── server/                         # Server 后端镜像配置
│   └── Dockerfile                 # Server Dockerfile
├── docker-compose.yml             # 生产环境配置
├── docker-compose.dev.yml         # 开发环境配置
├── docker-compose.override.yml.example  # 本地覆盖配置示例
└── env-template.txt               # 环境变量配置模板

```

## 🚀 快速开始

### 方式一：完整部署（推荐）

从项目根目录运行：

```bash
# 使用 Makefile
make prod-up

# 或使用 Docker Compose
docker-compose -f docker/docker-compose.yml up -d
```

### 方式二：开发环境

只启动基础服务（PostgreSQL + MQTT）：

```bash
# 使用 Makefile
make dev-up

# 或使用 Docker Compose
docker-compose -f docker/docker-compose.dev.yml up -d
```

## 📋 配置文件说明

### docker-compose.yml

生产环境完整部署配置，包含：
- PostgreSQL 数据库
- EMQX MQTT Broker
- SCM Server API
- SCM Admin 前端

### docker-compose.dev.yml

开发环境基础服务配置，仅包含：
- PostgreSQL 数据库
- EMQX MQTT Broker

开发时本地运行 `pnpm dev` 启动应用。

### docker-compose.override.yml（可选）

用于本地覆盖配置（如端口冲突），不会提交到版本控制。

```bash
# 复制示例文件
cp docker-compose.override.yml.example docker-compose.override.yml

# 编辑配置
vim docker-compose.override.yml
```

## 🔧 配置环境变量

### 使用环境变量文件

```bash
# 查看环境变量模板
cat env-template.txt

# 在 docker 目录创建 .env 文件
cd docker
vim .env
```

### 主要配置项

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `POSTGRES_PASSWORD` | 数据库密码 | scmpassword |
| `DATABASE_URL` | 数据库连接字符串 | postgresql://... |
| `MQTT_USERNAME` | MQTT 用户名 | (空) |
| `MQTT_PASSWORD` | MQTT 密码 | (空) |
| `VITE_API_URL` | 前端 API 地址 | http://localhost:3000 |

## 🐳 Dockerfile 说明

### Server Dockerfile

多阶段构建，包括：
1. **构建阶段**：编译 TypeScript，生成 Prisma Client
2. **生产阶段**：仅复制必要文件，运行编译后的代码

特点：
- 使用 pnpm monorepo 结构
- 自动执行数据库迁移
- 包含健康检查

### Admin Dockerfile

多阶段构建，包括：
1. **构建阶段**：使用 Vite 构建 Vue 应用
2. **生产阶段**：使用 Nginx 服务静态文件

特点：
- Gzip 压缩
- SPA 路由支持
- API 反向代理
- 静态资源缓存

## 🌐 服务端口

| 服务 | 容器端口 | 主机端口 | 说明 |
|------|---------|---------|------|
| admin | 80 | 8080 | Web 前端 |
| server | 3000 | 3000 | REST API |
| postgres | 5432 | 5432 | PostgreSQL |
| mqtt | 1883 | 1883 | MQTT TCP |
| mqtt | 8083 | 8083 | MQTT WebSocket |
| mqtt | 18083 | 18083 | EMQX Dashboard |

## 📊 数据持久化

以下数据使用 Docker Volume 持久化：

- `postgres_data`: PostgreSQL 数据
- `emqx_data`: EMQX 数据
- `emqx_log`: EMQX 日志

## 🔍 常用命令

从项目根目录运行：

```bash
# 启动服务
make prod-up

# 查看状态
make ps

# 查看日志
make logs                 # 所有服务
make logs-server         # Server 日志
make logs-admin          # Admin 日志

# 重启服务
make restart             # 所有服务
make restart-server      # Server
make restart-admin       # Admin

# 进入容器
make shell-server        # Server 容器
make shell-db            # 数据库

# 停止服务
make prod-down           # 停止（保留数据）
make clean               # 停止并清理数据
```

或使用 Docker Compose：

```bash
# 从项目根目录
docker-compose -f docker/docker-compose.yml [command]

# 或进入 docker 目录
cd docker
docker-compose [command]
```

## 🛠️ 高级用法

### 1. 只构建特定服务

```bash
docker-compose -f docker/docker-compose.yml build server
docker-compose -f docker/docker-compose.yml up -d server
```

### 2. 查看实时日志

```bash
docker-compose -f docker/docker-compose.yml logs -f --tail=100 server
```

### 3. 执行数据库迁移

```bash
docker exec -it scm-server sh -c "pnpm prisma migrate deploy"
```

### 4. 备份数据库

```bash
docker exec scm-postgres pg_dump -U scmuser scm > backup.sql
```

### 5. 恢复数据库

```bash
cat backup.sql | docker exec -i scm-postgres psql -U scmuser -d scm
```

### 6. 扩展服务

```bash
docker-compose -f docker/docker-compose.yml up -d --scale server=3
```

### 7. 限制资源

在 `docker-compose.yml` 中添加：

```yaml
services:
  server:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## 📚 更多文档

- [QUICK_START.md](../QUICK_START.md) - 快速开始指南
- [DOCKER.md](../DOCKER.md) - 完整部署文档
- [README.md](../README.md) - 项目文档

## 🆘 获取帮助

如遇到问题：

1. 查看服务日志：`make logs`
2. 检查服务状态：`make ps`
3. 运行健康检查：`./scripts/health-check.sh`
4. 查看完整文档：[DOCKER.md](../DOCKER.md)

---

**需要帮助？** 请查看主文档或提交 Issue。

