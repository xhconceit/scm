#!/bin/bash

# Docker 日志查看脚本

# 默认显示所有服务的日志
if [ $# -eq 0 ]; then
    echo "📋 查看所有服务日志..."
    echo "按 Ctrl+C 退出"
    echo ""
    docker-compose -f docker/docker-compose.yml logs -f
else
    echo "📋 查看 $1 服务日志..."
    echo "按 Ctrl+C 退出"
    echo ""
    docker-compose -f docker/docker-compose.yml logs -f $1
fi

