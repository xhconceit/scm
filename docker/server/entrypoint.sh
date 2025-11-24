#!/bin/sh
set -e

echo "🔍 等待数据库准备就绪..."
until node -e "const { Client } = require('pg'); const client = new Client(process.env.DATABASE_URL); client.connect().then(() => { console.log('数据库连接成功'); client.end(); process.exit(0); }).catch((e) => { console.error('数据库未就绪:', e.message); process.exit(1); });" 2>/dev/null; do
  echo "⏳ 数据库尚未就绪，等待..."
  sleep 2
done

echo "📋 运行数据库迁移..."
cd /app/apps/server

# 使用 Prisma Client 而不是 CLI 来避免二进制问题
# 直接执行 SQL 创建表
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  try {
    // 检查表是否存在
    await prisma.\$queryRaw\`
      CREATE TABLE IF NOT EXISTS \"SensorData\" (
        id TEXT PRIMARY KEY,
        \"clientId\" TEXT NOT NULL,
        topic TEXT NOT NULL,
        type INTEGER NOT NULL,
        module JSONB NOT NULL,
        \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \"updatedAt\" TIMESTAMP(3) NOT NULL
      );
    \`;
    
    await prisma.\$queryRaw\`
      CREATE TABLE IF NOT EXISTS \"SensorDataConfig\" (
        id TEXT PRIMARY KEY,
        type INTEGER NOT NULL,
        name TEXT NOT NULL,
        config JSONB NOT NULL,
        \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \"updatedAt\" TIMESTAMP(3) NOT NULL
      );
    \`;
    
    console.log('✅ 数据库表已创建/验证');
    await prisma.\$disconnect();
  } catch (error) {
    console.error('❌ 数据库迁移失败:', error);
    process.exit(1);
  }
}

migrate();
"

echo "🚀 启动应用..."
exec "$@"

