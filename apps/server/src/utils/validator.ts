import { RealtimeMessage } from '../types';

export class Validator {
  /**
   * 验证实时消息格式
   */
  static validateRealtimeMessage(data: any): data is RealtimeMessage {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // 验证 type 字段
    if (data.type !== 1 && data.type !== 2) {
      return false;
    }

    // 验证 module 字段
    if (!Array.isArray(data.module)) {
      return false;
    }

    // 验证 module 长度为 18
    if (data.module.length !== 18) {
      return false;
    }

    // 验证 module 中所有元素都是数字
    if (!data.module.every((item: any) => typeof item === 'number')) {
      return false;
    }

    return true;
  }

  /**
   * 验证设备ID
   */
  static validateDeviceId(deviceId: any): deviceId is number {
    return typeof deviceId === 'number' && deviceId > 0;
  }

  /**
   * 验证设备名称
   */
  static validateDeviceName(name: any): name is string {
    return typeof name === 'string' && name.trim().length > 0;
  }
}
