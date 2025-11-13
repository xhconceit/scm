/**
 * MQTT 实时消息结构
 */
export interface RealtimeMessage {
  type: 1 | 2;
  module: number[];
}

/**
 * 设备配置
 */
export interface DeviceConfig {
  id: number;
  name: string;
}

/**
 * MQTT 配置
 */
export interface MqttConfig {
  broker: string;
  port: number;
  wsPort?: number;
  clientPort?: number;
  username?: string;
  password?: string;
}

/**
 * API 响应格式
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
