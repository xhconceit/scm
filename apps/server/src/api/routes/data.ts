import Router from "@koa/router";
import logger from "../../utils/logger";
import { SensorData } from "../../services/sensor-data";

const router = new Router();

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

export default router;

