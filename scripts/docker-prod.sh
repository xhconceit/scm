#!/bin/bash

# Docker 生产环境部署脚本

set -e

echo "🚀 部署 SCM 生产环境..."
echo ""

# 构建镜像
echo "📦 构建 Docker 镜像..."
docker-compose -f docker/docker-compose.yml build

echo ""
echo "🔄 启动所有服务..."
docker-compose -f docker/docker-compose.yml up -d

echo ""
echo "⏳ 等待服务启动..."
sleep 10

echo ""
echo "📊 服务状态："
docker-compose -f docker/docker-compose.yml ps

echo ""
echo "✅ 部署完成！"
echo ""
echo "服务访问地址："
echo "  🖥️  Admin 前端: http://localhost:8080"
echo "  🔌 Server API: http://localhost:3000"
echo "  📡 MQTT Broker: localhost:1883"
echo "  📊 EMQX Dashboard: http://localhost:18083 (admin/public)"
echo ""
echo "常用命令："
echo "  查看日志: docker-compose -f docker/docker-compose.yml logs -f"
echo "  停止服务: docker-compose -f docker/docker-compose.yml down"
echo "  重启服务: docker-compose -f docker/docker-compose.yml restart"
echo ""

