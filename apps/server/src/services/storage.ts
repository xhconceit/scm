import prisma from '../database/client';
import { RealtimeMessage } from '../types';
import logger from '../utils/logger';

export class Storage {
  /**
   * 保存实时数据
   */
  static async saveRealtimeData(deviceId: number, message: RealtimeMessage): Promise<void> {
    try {
      // 确保设备存在
      await prisma.device.upsert({
        where: { deviceId },
        update: {
          status: 'online',
          updatedAt: new Date(),
        },
        create: {
          deviceId,
          name: `设备 #${deviceId}`,
          status: 'online',
        },
      });

      // 保存实时数据
      await prisma.realtimeData.create({
        data: {
          deviceId,
          type: message.type,
          module: message.module,
        },
      });

      logger.debug('Realtime data saved', { deviceId, type: message.type });
    } catch (error) {
      logger.error('Failed to save realtime data', { error, deviceId, message });
      throw error;
    }
  }

  /**
   * 获取设备实时数据（最新一条）
   */
  static async getRealtimeData(deviceId: number): Promise<RealtimeMessage | null> {
    try {
      const data = await prisma.realtimeData.findFirst({
        where: { deviceId },
        orderBy: { createdAt: 'desc' },
      });

      if (!data) {
        return null;
      }

      return {
        type: data.type as 1 | 2,
        module: data.module as number[],
      };
    } catch (error) {
      logger.error('Failed to get realtime data', { error, deviceId });
      throw error;
    }
  }

  /**
   * 获取设备历史数据
   */
  static async getHistoryData(
    deviceId: number,
    startTime?: Date,
    endTime?: Date,
    limit: number = 100
  ) {
    try {
      const where: any = { deviceId };
      
      if (startTime || endTime) {
        where.createdAt = {};
        if (startTime) where.createdAt.gte = startTime;
        if (endTime) where.createdAt.lte = endTime;
      }

      const data = await prisma.realtimeData.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return data.map((item) => ({
        id: item.id,
        deviceId: item.deviceId,
        type: item.type,
        module: item.module,
        createdAt: item.createdAt,
      }));
    } catch (error) {
      logger.error('Failed to get history data', { error, deviceId });
      throw error;
    }
  }
}
