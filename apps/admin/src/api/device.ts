import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { RealtimeMessage, Device, HistoryData, ApiResponse } from '../types';

/**
 * Axios 实例，默认指向 README 推荐的 `VITE_API_URL`
 */
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
});

/**
 * 设备相关 API 封装，保持与 README 中的接口文档一致
 */
export const deviceApi = {
  /**
   * 获取所有设备
   */
  getDevices(): Promise<AxiosResponse<ApiResponse<Device[]>>> {
    return api.get('/api/devices');
  },

  /**
   * 获取设备详情
   */
  getDeviceById(deviceId: number): Promise<AxiosResponse<ApiResponse<Device>>> {
    return api.get(`/api/devices/${deviceId}`);
  },

  /**
   * 创建设备
   */
  createDevice(data: { deviceId: number; name: string }): Promise<AxiosResponse<ApiResponse<Device>>> {
    return api.post('/api/devices', data);
  },

  /**
   * 更新设备
   */
  updateDevice(
    deviceId: number,
    data: { name?: string; status?: string }
  ): Promise<AxiosResponse<ApiResponse<Device>>> {
    return api.put(`/api/devices/${deviceId}`, data);
  },

  /**
   * 删除设备
   */
  deleteDevice(deviceId: number): Promise<AxiosResponse<ApiResponse>> {
    return api.delete(`/api/devices/${deviceId}`);
  },

  /**
   * 获取设备实时数据
   */
  getRealtimeData(deviceId: number): Promise<AxiosResponse<ApiResponse<RealtimeMessage>>> {
    return api.get(`/api/devices/${deviceId}/realtime`);
  },

  /**
   * 获取设备历史数据
   */
  getHistoryData(
    deviceId: number,
    params?: { startTime?: string; endTime?: string; limit?: number }
  ): Promise<AxiosResponse<ApiResponse<HistoryData[]>>> {
    return api.get(`/api/devices/${deviceId}/history`, { params });
  },
};
