import axios from 'axios';
import { RealtimeMessage, Device, HistoryData, ApiResponse } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
});

export const deviceApi = {
  // 获取所有设备
  getDevices: (): Promise<ApiResponse<Device[]>> =>
    api.get('/api/devices'),

  // 获取设备详情
  getDeviceById: (deviceId: number): Promise<ApiResponse<Device>> =>
    api.get(`/api/devices/${deviceId}`),

  // 创建设备
  createDevice: (data: { deviceId: number; name: string }): Promise<ApiResponse<Device>> =>
    api.post('/api/devices', data),

  // 更新设备
  updateDevice: (deviceId: number, data: { name?: string; status?: string }): Promise<ApiResponse<Device>> =>
    api.put(`/api/devices/${deviceId}`, data),

  // 删除设备
  deleteDevice: (deviceId: number): Promise<ApiResponse> =>
    api.delete(`/api/devices/${deviceId}`),

  // 获取设备实时数据
  getRealtimeData: (deviceId: number): Promise<ApiResponse<RealtimeMessage>> =>
    api.get(`/api/devices/${deviceId}/realtime`),

  // 获取设备历史数据
  getHistoryData: (
    deviceId: number,
    params?: { startTime?: string; endTime?: string; limit?: number }
  ): Promise<ApiResponse<HistoryData[]>> =>
    api.get(`/api/devices/${deviceId}/history`, { params }),
};
