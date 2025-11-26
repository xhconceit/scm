#!/bin/sh
set -e

echo "🔍 等待数据库准备就绪..."
echo "⏳ 等待 10 秒让数据库完全启动..."
sleep 10

echo "📋 运行数据库迁移..."
cd /app/apps/server

# 使用 Prisma Client 创建表
node << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  let retries = 5;
  while (retries > 0) {
    try {
      // 测试数据库连接
      await prisma.$connect();
      console.log('✅ 数据库连接成功');
      
      // 检查表是否存在，不存在则创建
      await prisma.$queryRaw`
        CREATE TABLE IF NOT EXISTS "SensorData" (
          id TEXT PRIMARY KEY,
          "clientId" TEXT NOT NULL,
          topic TEXT NOT NULL,
          type INTEGER NOT NULL,
          module JSONB NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL
        );
      `;
      
      await prisma.$queryRaw`
        CREATE TABLE IF NOT EXISTS "SensorDataConfig" (
          id TEXT PRIMARY KEY,
          type INTEGER NOT NULL,
          name TEXT NOT NULL,
          config JSONB NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL
        );
      `;
      
      console.log('✅ 数据库表已创建/验证');
      await prisma.$disconnect();
      break;
    } catch (error) {
      retries--;
      console.error('⚠️  数据库连接失败，重试中... 剩余次数:', retries);
      console.error('错误:', error.message);
      if (retries === 0) {
        console.error('❌ 数据库迁移失败');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

migrate();
EOF

echo "🚀 启动应用..."
exec "$@"
