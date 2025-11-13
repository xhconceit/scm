import { Context } from 'koa';
import prisma from '../../database/client';
import { Storage } from '../../services/storage';
import { Validator } from '../../utils/validator';
import logger from '../../utils/logger';
import { ApiResponse } from '../../types';

/**
 * 设备相关 RESTful 控制器，完全对应 README 中列出的 API
 */
export class DeviceController {
  /**
   * 获取所有设备
   */
  static async getAllDevices(ctx: Context): Promise<void> {
    try {
      const devices = await prisma.device.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const response: ApiResponse = {
        success: true,
        data: devices,
      };

      ctx.body = response;
    } catch (error) {
      logger.error('Failed to get devices', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Failed to get devices',
      } as ApiResponse;
    }
  }

  /**
   * 获取设备详情
   */
  static async getDeviceById(ctx: Context): Promise<void> {
    try {
      const deviceId = parseInt(ctx.params.id, 10);

      if (!Validator.validateDeviceId(deviceId)) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Invalid device ID',
        } as ApiResponse;
        return;
      }

      const device = await prisma.device.findUnique({
        where: { deviceId },
        include: {
          _count: {
            select: {
              realtimeData: true,
              historyData: true,
            },
          },
        },
      });

      if (!device) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: 'Device not found',
        } as ApiResponse;
        return;
      }

      ctx.body = {
        success: true,
        data: device,
      } as ApiResponse;
    } catch (error) {
      logger.error('Failed to get device', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Failed to get device',
      } as ApiResponse;
    }
  }

  /**
   * 创建设备
   */
  static async createDevice(ctx: Context): Promise<void> {
    try {
      const { deviceId, name } = ctx.request.body as { deviceId?: number; name?: string };

      if (!deviceId || !Validator.validateDeviceId(deviceId)) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Invalid device ID',
        } as ApiResponse;
        return;
      }

      if (!name || !Validator.validateDeviceName(name)) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Invalid device name',
        } as ApiResponse;
        return;
      }

      const device = await prisma.device.create({
        data: {
          deviceId,
          name: name.trim(),
        },
      });

      ctx.status = 201;
      ctx.body = {
        success: true,
        data: device,
      } as ApiResponse;
    } catch (error: any) {
      logger.error('Failed to create device', error);
      
      if (error.code === 'P2002') {
        ctx.status = 409;
        ctx.body = {
          success: false,
          error: 'Device already exists',
        } as ApiResponse;
        return;
      }

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Failed to create device',
      } as ApiResponse;
    }
  }

  /**
   * 更新设备
   */
  static async updateDevice(ctx: Context): Promise<void> {
    try {
      const deviceId = parseInt(ctx.params.id, 10);
      const { name, status } = ctx.request.body as { name?: string; status?: string };

      if (!Validator.validateDeviceId(deviceId)) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Invalid device ID',
        } as ApiResponse;
        return;
      }

      const updateData: any = {};
      if (name && Validator.validateDeviceName(name)) {
        updateData.name = name.trim();
      }
      if (status && (status === 'online' || status === 'offline')) {
        updateData.status = status;
      }

      const device = await prisma.device.update({
        where: { deviceId },
        data: updateData,
      });

      ctx.body = {
        success: true,
        data: device,
      } as ApiResponse;
    } catch (error: any) {
      logger.error('Failed to update device', error);
      
      if (error.code === 'P2025') {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: 'Device not found',
        } as ApiResponse;
        return;
      }

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Failed to update device',
      } as ApiResponse;
    }
  }

  /**
   * 删除设备
   */
  static async deleteDevice(ctx: Context): Promise<void> {
    try {
      const deviceId = parseInt(ctx.params.id, 10);

      if (!Validator.validateDeviceId(deviceId)) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Invalid device ID',
        } as ApiResponse;
        return;
      }

      await prisma.device.delete({
        where: { deviceId },
      });

      ctx.body = {
        success: true,
        message: 'Device deleted successfully',
      } as ApiResponse;
    } catch (error: any) {
      logger.error('Failed to delete device', error);
      
      if (error.code === 'P2025') {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: 'Device not found',
        } as ApiResponse;
        return;
      }

      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Failed to delete device',
      } as ApiResponse;
    }
  }

  /**
   * 获取设备实时数据
   */
  static async getRealtimeData(ctx: Context): Promise<void> {
    try {
      const deviceId = parseInt(ctx.params.id, 10);

      if (!Validator.validateDeviceId(deviceId)) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Invalid device ID',
        } as ApiResponse;
        return;
      }

      const data = await Storage.getRealtimeData(deviceId);

      if (!data) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: 'No realtime data found',
        } as ApiResponse;
        return;
      }

      ctx.body = {
        success: true,
        data,
      } as ApiResponse;
    } catch (error) {
      logger.error('Failed to get realtime data', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Failed to get realtime data',
      } as ApiResponse;
    }
  }

  /**
   * 获取设备历史数据
   */
  static async getHistoryData(ctx: Context): Promise<void> {
    try {
      const deviceId = parseInt(ctx.params.id, 10);
      const startTime = ctx.query.startTime ? new Date(ctx.query.startTime as string) : undefined;
      const endTime = ctx.query.endTime ? new Date(ctx.query.endTime as string) : undefined;
      const limit = ctx.query.limit ? parseInt(ctx.query.limit as string, 10) : 100;

      if (!Validator.validateDeviceId(deviceId)) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Invalid device ID',
        } as ApiResponse;
        return;
      }

      const data = await Storage.getHistoryData(deviceId, startTime, endTime, limit);

      ctx.body = {
        success: true,
        data,
      } as ApiResponse;
    } catch (error) {
      logger.error('Failed to get history data', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Failed to get history data',
      } as ApiResponse;
    }
  }
}
