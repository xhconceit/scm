// 消息数据类型
export interface RealtimeMessage {
  type: 1 | 2;
  module: number[]; // 长度为 18
}

// 设备类型
export interface Device {
  id: number;
  deviceId: number;
  name: string;
  status: 'online' | 'offline';
  createdAt: string;
  updatedAt: string;
}

// API 响应格式
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 历史数据
export interface HistoryData {
  id: number;
  deviceId: number;
  type: number;
  module: number[];
  createdAt: string;
}
