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

// 跨域 & JSON 解析中间件，保证前端可以直接访问
app.use(cors());
app.use(bodyParser());

// 健康检查端点，便于 K8s / Docker Compose 做存活检测
router.get('/health', async (ctx) => {
  ctx.body = { status: 'ok', timestamp: new Date().toISOString() };
});

// RESTful API 路由，与 README 中的接口列表保持一致
router.use('/api', deviceRoutes.routes());

app.use(router.routes());
app.use(router.allowedMethods());

// 全局错误日志，统一输出到 Winston
app.on('error', (err, ctx) => {
  logger.error('Application error', { error: err, path: ctx.path });
});

/**
 * 应用启动入口：
 * 1. 启动内置 MQTT Broker（TCP + WebSocket）
 * 2. 可选连接外部 Broker 拉取数据
 * 3. 启动 Koa HTTP 服务，暴露 RESTful API
 */
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
