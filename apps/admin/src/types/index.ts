/**
 * 与 README 中保持一致的实时消息类型
 */
export interface RealtimeMessage {
  type: 1 | 2;
  module: number[];
}

/**
 * 设备类型定义，对应后端返回的字段
 */
export interface Device {
  id: number;
  deviceId: number;
  name: string;
  status: 'online' | 'offline';
  createdAt: string;
  updatedAt: string;
}

/**
 * 后端统一响应结构
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * 设备历史数据
 */
export interface HistoryData {
  id: number;
  deviceId: number;
  type: number;
  module: number[];
  createdAt: string;
}
