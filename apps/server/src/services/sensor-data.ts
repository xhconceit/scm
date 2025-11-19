import { randomUUID } from "crypto";
import prisma from "../database/client";
import { RealtimeMessage } from "../types";
import logger from "../utils/logger";

export class SensorData {
  static async save(clientId: string, topic: string, message: RealtimeMessage) {
    try {
      await prisma.SensorData.create({
        data: {
          id: randomUUID(),
          clientId: clientId,
          topic: topic,
          type: message.type,
          module: JSON.stringify(message.module),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      logger.debug("传感器数据保存成功", { clientId, topic, message });
    } catch (error) {
      logger.error("传感器数据保存失败", { error, clientId, topic, message });
      throw error;
    }
  }
}
