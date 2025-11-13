import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

// 监听查询事件（开发环境）
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: any) => {
    logger.debug('Query', { query: e.query, params: e.params, duration: `${e.duration}ms` });
  });
}

// 连接数据库
prisma.$connect().catch((error) => {
  logger.error('Failed to connect to database', error);
  process.exit(1);
});

export default prisma;
