import Koa from "koa";
import Router from "@koa/router";
import cors from "@koa/cors";
import bodyParser from "koa-bodyparser";
import { config } from "./config/config";
import logger from "./utils/logger";
import { MqttCollector } from "./services/mqtt-collector";
import { SensorData } from "./services/sensor-data";
import { RealtimeMessage } from "./types";
import { registerRoutes } from "./api/routes";

const app = new Koa();
const router = new Router();

// 跨域 & JSON 解析中间件，保证前端可以直接访问
app.use(cors());
app.use(bodyParser());

// 注册所有路由
registerRoutes(router);

app.use(router.routes());
app.use(router.allowedMethods());

// 全局错误日志，统一输出到 Winston
app.on("error", (err, ctx) => {
  logger.error("Application error", { error: err, path: ctx.path });
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

    mqttCollector.on("message", async (message) => {
      // message.topic
      logger.info("MQTT 消息接收", message);
      try {
        const realtimeMessage: RealtimeMessage = JSON.parse(message.payload);
        // 使用 SensorData 服务保存数据
        await SensorData.save(message.clientId, message.topic, realtimeMessage);
        logger.info("MQTT 消息存储成功", realtimeMessage);
      } catch (error) {
        logger.error("MQTT 消息解析失败", error);
        logger.error("MQTT 消息内容", message.payload);
      }
    });

    // 启动 HTTP 服务器
    app.listen(config.port, () => {
      logger.info(`服务器端口 ${config.port}`);
      logger.info(`健康检查: http://localhost:${config.port}/health`);
      logger.info(`API: http://localhost:${config.port}/api`);
    });
  } catch (error) {
    logger.error("启动服务器失败", error);
    process.exit(1);
  }
}

startServer();
