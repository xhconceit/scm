import axios, { AxiosInstance } from "axios";

/**
 * Axios 实例
 */
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  timeout: 10000,
});

export interface ConfigItem {
  type: number;
  name: string;
  module: string[];
}

export interface DataItem {
  type: number;
  module: number[];
  timestamp: number;
}

export const sensorApi = {
  /**
   * 获取模块配置
   */
  getConfigs() {
    return api.get<{ success: boolean; data: ConfigItem[] }>("/api/config");
  },

  /**
   * 保存模块配置
   */
  saveConfigs(data: ConfigItem[]) {
    return api.post<{ success: boolean; message: string }>("/api/config", data);
  },

  /**
   * 获取历史数据
   */
  getHistory(params: { type: number; start: number; end: number }) {
    return api.get<{ success: boolean; data: DataItem[] }>("/api/data", {
      params,
    });
  },
};
