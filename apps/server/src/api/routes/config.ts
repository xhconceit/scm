import Router from "@koa/router";
import logger from "../../utils/logger";
import { SensorData } from "../../services/sensor-data";

const router = new Router();

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

export default router;

