#!/bin/bash

# Docker 开发环境启动脚本

set -e

echo "🚀 启动 SCM 开发环境基础服务..."
echo ""

# 启动 PostgreSQL 和 MQTT
docker-compose -f docker/docker-compose.dev.yml up -d

echo ""
echo "✅ 基础服务已启动！"
echo ""
echo "服务信息："
echo "  📊 PostgreSQL: localhost:5432"
echo "     - 数据库: scm_dev"
echo "     - 用户名: scmuser"
echo "     - 密码: scmpassword"
echo ""
echo "  📡 MQTT Broker: localhost:1883"
echo "     - WebSocket: localhost:8083"
echo "     - Dashboard: http://localhost:18083 (admin/public)"
echo ""
echo "现在可以在本地运行应用："
echo "  pnpm dev"
echo ""
echo "停止服务："
echo "  docker-compose -f docker/docker-compose.dev.yml down"
echo ""

