#!/bin/bash

# ========================================
# Docker 服务健康检查脚本
# ========================================

set -e

echo "🔍 检查 SCM 服务健康状态..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "检查 $service_name... "
    
    if command -v curl &> /dev/null; then
        status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    elif command -v wget &> /dev/null; then
        if wget --spider -q "$url" 2>/dev/null; then
            status_code="200"
        else
            status_code="000"
        fi
    else
        echo -e "${RED}✗${NC} (需要 curl 或 wget)"
        return 1
    fi
    
    if [ "$status_code" = "$expected_status" ] || [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✓${NC} (HTTP $status_code)"
        return 0
    else
        echo -e "${RED}✗${NC} (HTTP $status_code)"
        return 1
    fi
}

# 检查容器运行状态
check_container() {
    local container_name=$1
    echo -n "检查容器 $container_name... "
    
    if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        echo -e "${GREEN}✓${NC} (运行中)"
        return 0
    else
        echo -e "${RED}✗${NC} (未运行)"
        return 1
    fi
}

echo "📦 容器状态检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_container "scm-postgres" || true
check_container "scm-mqtt" || true
check_container "scm-server" || true
check_container "scm-admin" || true

echo ""
echo "🌐 服务健康检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_service "Server API" "http://localhost:3000/health" || true
check_service "Admin 前端" "http://localhost:8080/health" || true
check_service "EMQX Dashboard" "http://localhost:18083" || true

echo ""
echo "📊 详细状态"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker-compose -f docker/docker-compose.yml ps 2>/dev/null || echo "无法获取服务状态（docker-compose 未运行）"

echo ""
echo "💾 数据库连接测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker exec scm-postgres pg_isready -U scmuser -d scm &>/dev/null; then
    echo -e "${GREEN}✓${NC} PostgreSQL 连接正常"
else
    echo -e "${RED}✗${NC} PostgreSQL 连接失败"
fi

echo ""
echo "📡 MQTT 连接测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker exec scm-mqtt emqx ping &>/dev/null; then
    echo -e "${GREEN}✓${NC} MQTT Broker 运行正常"
else
    echo -e "${RED}✗${NC} MQTT Broker 运行异常"
fi

echo ""
echo "📋 资源使用情况"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" \
    scm-postgres scm-mqtt scm-server scm-admin 2>/dev/null || echo "无法获取资源使用情况"

echo ""
echo "✅ 健康检查完成！"
echo ""

