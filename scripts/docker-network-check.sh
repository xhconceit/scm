#!/bin/bash

# ========================================
# Docker 网络和镜像配置检查脚本
# ========================================

echo "🔍 检查 Docker 网络和镜像配置..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Docker 是否运行
echo "1️⃣ 检查 Docker 服务..."
if docker info > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Docker 服务运行正常"
else
    echo -e "${RED}✗${NC} Docker 服务未运行"
    echo "   请启动 Docker Desktop"
    exit 1
fi

echo ""

# 检查镜像加速器配置
echo "2️⃣ 检查镜像加速器配置..."
mirrors=$(docker info 2>/dev/null | grep -A 10 "Registry Mirrors:" | grep "http" || echo "")

if [ -n "$mirrors" ]; then
    echo -e "${GREEN}✓${NC} 镜像加速器已配置："
    echo "$mirrors" | while read -r line; do
        echo "   $line"
    done
else
    echo -e "${YELLOW}⚠${NC} 未检测到镜像加速器配置"
    echo "   配置文件位置：~/.docker/daemon.json"
    
    if [ -f ~/.docker/daemon.json ]; then
        echo "   当前配置内容："
        cat ~/.docker/daemon.json | head -20
    else
        echo "   配置文件不存在"
    fi
    
    echo ""
    echo "   📖 请参考 DOCKER_NETWORK_FIX.md 进行配置"
fi

echo ""

# 测试网络连接
echo "3️⃣ 测试网络连接..."

echo -n "   测试 Docker Hub... "
if timeout 5 curl -s https://hub.docker.com > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC} (无法访问)"
fi

echo -n "   测试上海交大镜像... "
if timeout 5 curl -s https://docker.mirrors.sjtug.sjtu.edu.cn > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC} (无法访问)"
fi

echo -n "   测试百度云镜像... "
if timeout 5 curl -s https://mirror.baidubce.com > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC} (无法访问)"
fi

echo ""

# 测试拉取镜像
echo "4️⃣ 测试镜像拉取..."
echo -n "   尝试拉取 alpine:latest... "

if timeout 30 docker pull alpine:latest > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
    # 清理测试镜像
    docker rmi alpine:latest > /dev/null 2>&1
else
    echo -e "${RED}✗${NC}"
    echo "   网络可能不稳定或镜像配置未生效"
fi

echo ""

# 显示当前镜像
echo "5️⃣ 本地镜像列表..."
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | head -10

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 建议
if [ -n "$mirrors" ]; then
    echo "✅ 配置检查完成！可以尝试运行："
    echo "   make prod-up"
else
    echo "⚠️  建议配置镜像加速器后再试："
    echo "   1. 查看配置指南：cat DOCKER_NETWORK_FIX.md"
    echo "   2. 配置完成后重启 Docker Desktop"
    echo "   3. 重新运行此脚本验证"
    echo ""
    echo "   或使用开发模式（无需构建镜像）："
    echo "   make dev-up"
fi

echo ""

