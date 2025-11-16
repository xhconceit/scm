import { randomUUID } from "crypto";
import prisma from "../database/client";
import { RealtimeMessage } from "../types";
import logger from "../utils/logger";

/**
 * 数据存储层：
 * - 实时数据写入 `realtime_data`
 * - 历史数据查询支持时间范围与条数限制
 */
export class Storage {
  /**
   * 保存实时数据
   */
  static async saveData(
    clientId: string,
    topic: string,
    message: RealtimeMessage
  ): Promise<void> {
    try {
      await prisma.data.create({
        data: {
          id: randomUUID(),
          clientId: clientId,
          topic: topic,
          type: message.type,
          module: message.module,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.debug("Realtime data saved", { clientId, topic, type: message.type });
    } catch (error) {
      logger.error("Failed to save realtime data", {
        error,
        clientId,
        topic,
        message,
      });
      throw error;
    }
  }
}
