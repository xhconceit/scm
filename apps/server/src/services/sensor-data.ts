import { randomUUID } from "crypto";
import prisma from "../database/client";
import { RealtimeMessage } from "../types";
import logger from "../utils/logger";

/**
 * 传感器数据服务
 * 处理数据的存储、查询以及配置管理
 */
export class SensorData {
  /**
   * 保存实时传感器数据
   * @param clientId 客户端标识
   * @param topic MQTT 主题
   * @param message 消息内容
   */
  static async save(clientId: string, topic: string, message: RealtimeMessage) {
    try {
      // 使用 prisma.sensorData (通常生成的客户端属性名为驼峰式)
      await prisma.sensorData.create({
        data: {
          id: randomUUID(),
          clientId: clientId,
          topic: topic,
          type: message.type,
          // 直接存储对象，Prisma 会自动处理 Json 类型
          module: message.module as any,
          createdAt: new Date(),
          // updatedAt 由数据库自动维护 (但 schema 中没有 @default(now()) for updatedAt?
          // Schema has @updatedAt which updates on update, but on create strictly usually needs value if not default?
          // Prisma @updatedAt handles it.
        },
      });
      logger.debug("传感器数据保存成功", { clientId, topic, message });
    } catch (error) {
      logger.error("传感器数据保存失败", { error, clientId, topic, message });
      // 不抛出错误，避免中断主流程，但记录日志
    }
  }

  /**
   * 获取历史数据
   * @param type 模块类型
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @returns 数据列表
   */
  static async getHistory(type: number, startTime: Date, endTime: Date) {
    try {
      const data = await prisma.sensorData.findMany({
        where: {
          type: type,
          createdAt: {
            gte: startTime,
            lte: endTime,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        // 限制返回数量防止过大，实际生产中可能需要降采样或分页
        take: 5000,
      });

      return data.map((item) => ({
        type: item.type,
        // Prisma 读取 Json 类型会自动解析
        module: item.module,
        timestamp: item.createdAt.getTime(),
      }));
    } catch (error) {
      logger.error("获取历史数据失败", { error, type, startTime, endTime });
      throw error;
    }
  }

  /**
   * 获取所有模块配置
   * @returns 配置列表
   */
  static async getConfigs() {
    try {
      const configs = await prisma.sensorDataConfig.findMany({
        orderBy: {
          type: "asc",
        },
      });
      return configs.map((c) => ({
        type: c.type,
        name: c.name,
        // config 字段存储的是通道名称数组
        module: c.config,
      }));
    } catch (error) {
      logger.error("获取配置失败", error);
      throw error;
    }
  }

  /**
   * 保存/更新配置
   * @param configs 配置列表
   */
  static async saveConfigs(configs: any[]) {
    try {
      // 使用事务处理批量更新
      await prisma.$transaction(async (tx) => {
        // 简单策略：遍历保存，存在则更新，不存在则创建
        // 这里假设 configs 是全量数据
        for (const config of configs) {
          const existing = await tx.sensorDataConfig.findFirst({
            where: { type: config.type },
          });

          if (existing) {
            await tx.sensorDataConfig.update({
              where: { id: existing.id },
              data: {
                name: config.name,
                config: config.module as any, // 存储通道配置
              },
            });
          } else {
            await tx.sensorDataConfig.create({
              data: {
                type: config.type,
                name: config.name,
                config: config.module as any,
              },
            });
          }
        }
      });
      logger.info("配置保存成功", { count: configs.length });
    } catch (error) {
      logger.error("配置保存失败", error);
      throw error;
    }
  }
}
