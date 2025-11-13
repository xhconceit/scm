#!/bin/bash

# Docker 停止脚本

set -e

echo "⏹️  停止 SCM 服务..."
echo ""

# 询问是否删除数据卷
read -p "是否删除数据卷（会清空数据库）？[y/N] " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🗑️  停止服务并删除数据卷..."
    docker-compose -f docker/docker-compose.yml down -v
    echo "✅ 服务已停止，数据卷已删除"
else
    echo "🛑 停止服务（保留数据）..."
    docker-compose -f docker/docker-compose.yml down
    echo "✅ 服务已停止，数据已保留"
fi

echo ""

