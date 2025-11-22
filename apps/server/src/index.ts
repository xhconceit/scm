import Koa from "koa";
import Router from "@koa/router";
import cors from "@koa/cors";
import bodyParser from "koa-bodyparser";
import { config } from "./config/config";
import logger from "./utils/logger";
import { MqttCollector } from "./services/mqtt-collector";
import { SensorData } from "./services/sensor-data";
import { RealtimeMessage } from "./types";

const app = new Koa();
const router = new Router();

// 跨域 & JSON 解析中间件，保证前端可以直接访问
app.use(cors());
app.use(bodyParser());

// 健康检查端点，便于 K8s / Docker Compose 做存活检测
router.get("/health", async (ctx) => {
  ctx.body = { status: "ok", timestamp: new Date().toISOString() };
});

// ==========================================
// API 路由配置
// ==========================================

/**
 * 获取配置列表
 * 用于 Dashboard 和 Settings 页面初始化
 */
router.get("/api/config", async (ctx) => {
  try {
    const data = await SensorData.getConfigs();
    ctx.body = { success: true, data };
  } catch (error) {
    logger.error("API Error: /api/config", error);
    ctx.status = 500;
    ctx.body = { success: false, message: "Internal Server Error" };
  }
});

/**
 * 保存配置列表
 * 用于 Settings 页面保存配置
 */
router.post("/api/config", async (ctx) => {
  try {
    const body = ctx.request.body as any[];
    // 简单校验：必须是数组
    if (!Array.isArray(body)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Invalid request body, array expected",
      };
      return;
    }
    await SensorData.saveConfigs(body);
    ctx.body = { success: true, message: "Configuration saved successfully" };
  } catch (error) {
    logger.error("API Error: /api/config", error);
    ctx.status = 500;
    ctx.body = { success: false, message: "Internal Server Error" };
  }
});

/**
 * 获取历史传感器数据
 * Query Params:
 * - type: 模块类型 (number)
 * - start: 开始时间戳 (number)
 * - end: 结束时间戳 (number)
 */
router.get("/api/data", async (ctx) => {
  try {
    const { type, start, end } = ctx.query;

    if (!type || !start || !end) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Missing required query parameters: type, start, end",
      };
      return;
    }

    const typeNum = Number(type);
    const startTime = new Date(Number(start));
    const endTime = new Date(Number(end));

    if (
      isNaN(typeNum) ||
      isNaN(startTime.getTime()) ||
      isNaN(endTime.getTime())
    ) {
      ctx.status = 400;
      ctx.body = { success: false, message: "Invalid parameter format" };
      return;
    }

    const data = await SensorData.getHistory(typeNum, startTime, endTime);
    ctx.body = { success: true, data };
  } catch (error) {
    logger.error("API Error: /api/data", error);
    ctx.status = 500;
    ctx.body = { success: false, message: "Internal Server Error" };
  }
});

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
