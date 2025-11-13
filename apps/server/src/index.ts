import Koa from 'koa';
import Router from '@koa/router';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import { config } from './config/config';
import logger from './utils/logger';
import deviceRoutes from './api/routes/devices';
import { MqttCollector } from './services/mqtt-collector';

const app = new Koa();
const router = new Router();

// 中间件
app.use(cors());
app.use(bodyParser());

// 健康检查
router.get('/health', async (ctx) => {
  ctx.body = { status: 'ok', timestamp: new Date().toISOString() };
});

// API 路由
router.use('/api', deviceRoutes.routes());

app.use(router.routes());
app.use(router.allowedMethods());

// 错误处理
app.on('error', (err, ctx) => {
  logger.error('Application error', { error: err, path: ctx.path });
});

// 启动服务器
async function startServer() {
  try {
    // 启动内置 MQTT Broker
    const mqttCollector = new MqttCollector();
    await mqttCollector.startBroker();

    // 如果配置了外部 Broker，连接到外部 Broker
    if (config.mqtt.broker && config.mqtt.broker !== 'mqtt://localhost') {
      await mqttCollector.connectToBroker();
    }

    // 启动 HTTP 服务器
    app.listen(config.port, () => {
      logger.info(`Server started on port ${config.port}`);
      logger.info(`Health check: http://localhost:${config.port}/health`);
      logger.info(`API: http://localhost:${config.port}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();
