# 🚀 SCM 项目快速部署指南

> 5分钟快速部署完整的 SCM 传感器数据采集系统

## 📋 前置要求

- ✅ Docker 20.10+
- ✅ Docker Compose 2.0+
- ✅ Make（可选，但推荐）

## ⚡ 快速开始

### 方式一：使用 Makefile（推荐）

```bash
# 1. 启动所有服务
make prod-up

# 2. 查看服务状态
make ps

# 3. 查看日志
make logs
```

### 方式二：使用脚本

```bash
# 1. 启动服务
./scripts/docker-prod.sh

# 2. 健康检查
./scripts/health-check.sh

# 3. 查看日志
./scripts/docker-logs.sh
```

### 方式三：使用 Docker Compose

```bash
# 1. 构建镜像
docker-compose -f docker/docker-compose.yml build

# 2. 启动服务
docker-compose -f docker/docker-compose.yml up -d

# 3. 查看状态
docker-compose -f docker/docker-compose.yml ps
```

## 🌐 访问应用

服务启动后，访问以下地址：

| 服务 | 地址 | 说明 |
|------|------|------|
| 🖥️ **管理后台** | http://localhost:8080 | Vue3 + Naive UI 前端 |
| 🔌 **API 服务** | http://localhost:3000 | Koa REST API |
| 📡 **MQTT Broker** | mqtt://localhost:1883 | MQTT TCP 连接 |
| 🌐 **MQTT WebSocket** | ws://localhost:8083 | MQTT WebSocket 连接 |
| 📊 **EMQX Dashboard** | http://localhost:18083 | 用户名: admin, 密码: public |
| 🗄️ **PostgreSQL** | localhost:5432 | 数据库: scm, 用户: scmuser |

## 🔧 常用操作

### 查看日志

```bash
# 所有服务日志
make logs

# 单个服务日志
make logs-server    # Server 日志
make logs-admin     # Admin 日志
make logs-mqtt      # MQTT 日志
make logs-db        # 数据库日志
```

### 重启服务

```bash
# 重启所有服务
make restart

# 重启单个服务
make restart-server
make restart-admin
```

### 健康检查

```bash
# 检查所有服务健康状态
./scripts/health-check.sh
```

### 数据备份

```bash
# 备份数据库
./scripts/backup.sh

# 恢复数据库
./scripts/restore.sh
```

### 进入容器

```bash
# 进入 Server 容器
make shell-server

# 进入数据库
make shell-db

# 查看 Prisma Studio
make db-studio
```

### 停止服务

```bash
# 停止所有服务（保留数据）
make prod-down

# 停止并清理所有数据
make clean
```

## ⚙️ 自定义配置

### 1. 修改端口

如果默认端口冲突，编辑 `docker/docker-compose.yml`：

```yaml
services:
  admin:
    ports:
      - "9000:80"    # 改为 9000 端口
  
  server:
    ports:
      - "4000:3000"  # 改为 4000 端口
```

### 2. 修改数据库密码

编辑 `docker/docker-compose.yml`：

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: your_secure_password  # 修改这里
  
  server:
    environment:
      DATABASE_URL: postgresql://scmuser:your_secure_password@postgres:5432/scm
```

### 3. 使用本地覆盖配置

```bash
# 复制覆盖配置示例
cp docker/docker-compose.override.yml.example docker/docker-compose.override.yml

# 编辑配置
vim docker/docker-compose.override.yml

# Docker Compose 会自动合并配置
docker-compose -f docker/docker-compose.yml up -d
```

## 🛠️ 开发环境

如果你只想运行基础服务（PostgreSQL + MQTT），在本地开发代码：

```bash
# 1. 启动基础服务
make dev-up

# 2. 安装依赖
pnpm install

# 3. 运行开发服务器
pnpm dev

# 4. 停止基础服务
make dev-down
```

## 🔍 故障排查

### 服务无法启动

```bash
# 1. 查看详细日志
docker-compose -f docker/docker-compose.yml logs

# 2. 检查端口是否被占用
lsof -i :3000
lsof -i :8080
lsof -i :5432

# 3. 重新构建
make build-no-cache
make prod-up
```

### 数据库连接失败

```bash
# 1. 检查数据库状态
docker-compose -f docker/docker-compose.yml ps postgres

# 2. 查看数据库日志
make logs-db

# 3. 测试连接
docker exec -it scm-postgres psql -U scmuser -d scm
```

### MQTT 连接问题

```bash
# 1. 查看 MQTT 日志
make logs-mqtt

# 2. 访问 EMQX Dashboard
open http://localhost:18083

# 3. 重启 MQTT 服务
docker-compose -f docker/docker-compose.yml restart mqtt
```

### 清理和重置

```bash
# 停止所有服务并删除数据
make clean

# 清理 Docker 系统
docker system prune -a

# 重新部署
make prod-up
```

## 📊 性能监控

```bash
# 实时查看资源使用
docker stats

# 查看磁盘使用
docker system df

# 健康检查
./scripts/health-check.sh
```

## 🔐 生产环境部署建议

1. ✅ **修改所有默认密码**
   - PostgreSQL 密码
   - MQTT 密码（如需要）

2. ✅ **配置 HTTPS**
   - 使用 Nginx/Caddy 作为反向代理
   - 配置 SSL 证书（Let's Encrypt）

3. ✅ **限制暴露端口**
   - 只暴露必要的端口（80/443）
   - 内部服务不对外暴露

4. ✅ **配置防火墙**
   ```bash
   # 示例：只允许必要端口
   ufw allow 80
   ufw allow 443
   ufw enable
   ```

5. ✅ **定期备份**
   ```bash
   # 设置定时任务
   crontab -e
   
   # 每天凌晨 2 点备份
   0 2 * * * cd /path/to/scm && ./scripts/backup.sh
   ```

6. ✅ **监控和日志**
   - 配置日志轮转
   - 使用监控工具（如 Prometheus + Grafana）

7. ✅ **资源限制**
   - 在 docker-compose.yml 中配置内存和 CPU 限制

## 📚 更多文档

- 📖 [完整 Docker 部署文档](./DOCKER.md)
- 📖 [API 文档](./README.md#api-文档)
- 📖 [开发指南](./README.md#开发)

## 🆘 获取帮助

```bash
# 查看 Makefile 所有命令
make help

# 查看健康状态
./scripts/health-check.sh

# 查看服务日志
make logs
```

如遇到问题，请查看日志或提交 Issue。

---

**祝部署顺利！** 🎉

