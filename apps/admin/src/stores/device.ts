import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Device, RealtimeMessage } from '../types';
import { deviceApi } from '../api/device';

/**
 * 设备相关状态仓库，负责管理设备列表、详情以及实时数据
 * 对应 README 的「Admin - API 调用」章节
 */
export const useDeviceStore = defineStore('device', () => {
  const devices = ref<Device[]>([]);
  const currentDevice = ref<Device | null>(null);
  const realtimeData = ref<RealtimeMessage | null>(null);
  const loading = ref(false);

  /**
   * 获取所有设备
   */
  const fetchDevices = async () => {
    loading.value = true;
    try {
      const response = await deviceApi.getDevices();
      if (response.data.success && response.data.data) {
        devices.value = response.data.data;
      }
    } catch (error) {
      console.error('Failed to fetch devices', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取设备详情，用于设备管理页的查看操作
   */
  const fetchDeviceById = async (deviceId: number) => {
    loading.value = true;
    try {
      const response = await deviceApi.getDeviceById(deviceId);
      if (response.data.success && response.data.data) {
        currentDevice.value = response.data.data;
      }
    } catch (error) {
      console.error('Failed to fetch device', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取实时数据，供实时监控页面轮询使用
   */
  const fetchRealtimeData = async (deviceId: number) => {
    try {
      const response = await deviceApi.getRealtimeData(deviceId);
      if (response.data.success && response.data.data) {
        realtimeData.value = response.data.data;
      }
    } catch (error) {
      console.error('Failed to fetch realtime data', error);
    }
  };

  /**
   * 创建设备，成功后会重新拉取设备列表
   */
  const createDevice = async (data: { deviceId: number; name: string }) => {
    try {
      const response = await deviceApi.createDevice(data);
      if (response.data.success) {
        await fetchDevices();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to create device', error);
      return false;
    }
  };

  /**
   * 更新设备基础信息
   */
  const updateDevice = async (deviceId: number, data: { name?: string; status?: string }) => {
    try {
      const response = await deviceApi.updateDevice(deviceId, data);
      if (response.data.success) {
        await fetchDevices();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update device', error);
      return false;
    }
  };

  /**
   * 删除设备
   */
  const deleteDevice = async (deviceId: number) => {
    try {
      const response = await deviceApi.deleteDevice(deviceId);
      if (response.data.success) {
        await fetchDevices();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete device', error);
      return false;
    }
  };

  return {
    devices,
    currentDevice,
    realtimeData,
    loading,
    fetchDevices,
    fetchDeviceById,
    fetchRealtimeData,
    createDevice,
    updateDevice,
    deleteDevice,
  };
});
