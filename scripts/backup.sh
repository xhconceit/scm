#!/bin/bash

# ========================================
# Docker 数据备份脚本
# ========================================

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🗄️  开始备份 SCM 数据..."
echo ""

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份数据库
echo "📦 备份 PostgreSQL 数据库..."
docker exec scm-postgres pg_dump -U scmuser scm > "$BACKUP_DIR/database_$TIMESTAMP.sql"
echo "✅ 数据库备份完成: $BACKUP_DIR/database_$TIMESTAMP.sql"

# 压缩备份
echo ""
echo "🗜️  压缩备份文件..."
gzip "$BACKUP_DIR/database_$TIMESTAMP.sql"
echo "✅ 压缩完成: $BACKUP_DIR/database_$TIMESTAMP.sql.gz"

# 显示备份文件大小
echo ""
echo "📊 备份文件信息:"
ls -lh "$BACKUP_DIR/database_$TIMESTAMP.sql.gz"

# 清理旧备份（保留最近7天）
echo ""
echo "🧹 清理 7 天前的旧备份..."
find "$BACKUP_DIR" -name "database_*.sql.gz" -mtime +7 -delete
echo "✅ 清理完成"

echo ""
echo "📝 当前所有备份:"
ls -lh "$BACKUP_DIR"

echo ""
echo "✅ 备份完成！"
echo ""
echo "恢复备份命令:"
echo "  gunzip < $BACKUP_DIR/database_$TIMESTAMP.sql.gz | docker exec -i scm-postgres psql -U scmuser -d scm"
echo ""

