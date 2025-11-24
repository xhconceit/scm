#!/bin/bash

# ========================================
# Docker 数据恢复脚本
# ========================================

set -e

BACKUP_DIR="./backups"

echo "🔄 SCM 数据恢复工具"
echo ""

# 检查备份目录
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ 错误: 备份目录不存在: $BACKUP_DIR"
    exit 1
fi

# 列出可用的备份
echo "📋 可用的备份文件:"
echo ""
ls -lh "$BACKUP_DIR"/database_*.sql.gz 2>/dev/null || {
    echo "❌ 没有找到备份文件"
    exit 1
}

echo ""
echo "请选择要恢复的备份文件（输入文件名）:"
read -r backup_file

# 检查文件是否存在
if [ ! -f "$BACKUP_DIR/$backup_file" ]; then
    echo "❌ 错误: 文件不存在: $BACKUP_DIR/$backup_file"
    exit 1
fi

# 确认恢复
echo ""
echo "⚠️  警告: 此操作将覆盖当前数据库！"
echo "要恢复的备份: $backup_file"
read -p "确认继续？[y/N] " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 已取消恢复"
    exit 0
fi

# 停止服务
echo ""
echo "⏹️  停止相关服务..."
docker-compose -f docker/docker-compose.yml stop server

# 恢复数据库
echo ""
echo "🔄 恢复数据库..."
gunzip < "$BACKUP_DIR/$backup_file" | docker exec -i scm-postgres psql -U scmuser -d scm

echo ""
echo "✅ 数据库恢复完成！"

# 重启服务
echo ""
echo "🔄 重启服务..."
docker-compose -f docker/docker-compose.yml start server

echo ""
echo "✅ 恢复完成！"
echo ""

