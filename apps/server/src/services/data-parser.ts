import { RealtimeMessage } from '../types';
import { Validator } from '../utils/validator';
import logger from '../utils/logger';

export class DataParser {
  /**
   * 解析 MQTT 消息
   */
  static parse(payload: string): RealtimeMessage | null {
    try {
      const data = JSON.parse(payload);
      
      if (!Validator.validateRealtimeMessage(data)) {
        logger.warn('Invalid message format', { payload });
        return null;
      }
      
      return data as RealtimeMessage;
    } catch (error) {
      logger.error('Failed to parse message', { error, payload });
      return null;
    }
  }

  /**
   * 从主题中提取设备ID
   * 主题格式: sugarcane harvester/1001/realtime
   */
  static extractDeviceId(topic: string): number | null {
    const match = topic.match(/sugarcane harvester\/(\d+)\/realtime/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return null;
  }
}
