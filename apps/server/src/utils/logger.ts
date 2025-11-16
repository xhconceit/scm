import winston from 'winston';
import { config } from '../config/config';

const logger = winston.createLogger({
  level: config.logLevel, // 日志级别
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // 时间戳
    winston.format.errors({ stack: true }), // 错误堆栈
    winston.format.splat(), // 格式化
    winston.format.json() // 日志格式
  ),
  defaultMeta: { service: 'scm-server' }, // 默认元数据
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }), // 错误日志
    new winston.transports.File({ filename: 'logs/combined.log' }), // 合并日志
  ],
});

if (config.nodeEnv !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // 颜色化
        winston.format.simple() // 简单格式
      ),
    }) // 控制台日志
  );
}

export default logger;
