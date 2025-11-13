.PHONY: help dev-up dev-down prod-up prod-down logs build clean

# 默认目标
help:
	@echo "SCM 项目 Docker 管理命令"
	@echo ""
	@echo "开发环境:"
	@echo "  make dev-up       启动开发环境基础服务（PostgreSQL + MQTT）"
	@echo "  make dev-down     停止开发环境服务"
	@echo ""
	@echo "生产环境:"
	@echo "  make prod-up      构建并启动生产环境（所有服务）"
	@echo "  make prod-down    停止生产环境服务"
	@echo ""
	@echo "其他命令:"
	@echo "  make logs         查看所有服务日志"
	@echo "  make logs-server  查看 server 日志"
	@echo "  make logs-admin   查看 admin 日志"
	@echo "  make ps           查看服务状态"
	@echo "  make build        构建 Docker 镜像"
	@echo "  make clean        清理容器和数据卷"
	@echo "  make restart      重启所有服务"
	@echo ""

# 开发环境
dev-up:
	@echo "🚀 启动开发环境基础服务..."
	@docker-compose -f docker/docker-compose.dev.yml up -d
	@echo "✅ 基础服务已启动！"
	@echo "📊 PostgreSQL: localhost:5432 (scm_dev/scmuser/scmpassword)"
	@echo "📡 MQTT: localhost:1883 | Dashboard: http://localhost:18083"

dev-down:
	@echo "⏹️  停止开发环境服务..."
	@docker-compose -f docker/docker-compose.dev.yml down
	@echo "✅ 服务已停止"

# 生产环境
prod-up: build
	@echo "🚀 启动生产环境..."
	@docker-compose -f docker/docker-compose.yml up -d
	@sleep 5
	@docker-compose -f docker/docker-compose.yml ps
	@echo ""
	@echo "✅ 生产环境已启动！"
	@echo "🖥️  Admin: http://localhost:8080"
	@echo "🔌 API: http://localhost:3000"
	@echo "📡 MQTT: localhost:1883"

prod-down:
	@echo "⏹️  停止生产环境..."
	@docker-compose -f docker/docker-compose.yml down
	@echo "✅ 服务已停止"

# 日志
logs:
	@docker-compose -f docker/docker-compose.yml logs -f

logs-server:
	@docker-compose -f docker/docker-compose.yml logs -f server

logs-admin:
	@docker-compose -f docker/docker-compose.yml logs -f admin

logs-mqtt:
	@docker-compose -f docker/docker-compose.yml logs -f mqtt

logs-db:
	@docker-compose -f docker/docker-compose.yml logs -f postgres

# 服务状态
ps:
	@docker-compose -f docker/docker-compose.yml ps

# 构建
build:
	@echo "📦 构建 Docker 镜像..."
	@docker-compose -f docker/docker-compose.yml build

build-no-cache:
	@echo "📦 重新构建 Docker 镜像（不使用缓存）..."
	@docker-compose -f docker/docker-compose.yml build --no-cache

# 清理
clean:
	@echo "🗑️  清理容器和数据卷..."
	@docker-compose -f docker/docker-compose.yml down -v
	@echo "✅ 清理完成"

# 重启
restart:
	@echo "🔄 重启所有服务..."
	@docker-compose -f docker/docker-compose.yml restart
	@echo "✅ 服务已重启"

restart-server:
	@docker-compose -f docker/docker-compose.yml restart server

restart-admin:
	@docker-compose -f docker/docker-compose.yml restart admin

# 进入容器
shell-server:
	@docker exec -it scm-server sh

shell-admin:
	@docker exec -it scm-admin sh

shell-db:
	@docker exec -it scm-postgres psql -U scmuser -d scm

# 数据库操作
db-migrate:
	@echo "🔄 执行数据库迁移..."
	@docker exec -it scm-server sh -c "pnpm prisma migrate deploy"

db-studio:
	@echo "🖥️  启动 Prisma Studio..."
	@docker exec -it scm-server sh -c "pnpm prisma studio"

