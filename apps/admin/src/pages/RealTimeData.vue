<template>
  <div class="realtime-data">
    <el-row :gutter="20">
      <el-col :span="24">
        <h2>实时数据监控</h2>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>选择设备</span>
              <el-select v-model="selectedDeviceId" placeholder="请选择设备" style="width: 200px">
                <el-option
                  v-for="device in deviceStore.devices"
                  :key="device.id"
                  :label="device.name"
                  :value="device.deviceId"
                />
              </el-select>
              <el-button type="primary" @click="startPolling" :disabled="polling">
                开始监控
              </el-button>
              <el-button @click="stopPolling" :disabled="!polling">停止监控</el-button>
            </div>
          </template>
          <div v-if="deviceStore.realtimeData" class="data-content">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="数据类型">
                {{ deviceStore.realtimeData.type === 1 ? '类型一' : '类型二' }}
              </el-descriptions-item>
              <el-descriptions-item label="更新时间">
                {{ new Date().toLocaleString() }}
              </el-descriptions-item>
            </el-descriptions>
            <div style="margin-top: 20px">
              <h3>模块数据</h3>
              <ModuleStatus :modules="deviceStore.realtimeData.module" />
            </div>
          </div>
          <el-empty v-else description="请选择设备并开始监控" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useDeviceStore } from '../stores/device';
import ModuleStatus from '../components/ModuleStatus.vue';

const deviceStore = useDeviceStore();
const selectedDeviceId = ref<number | null>(null);
const polling = ref(false);
let pollingTimer: number | null = null;

onMounted(() => {
  // 页面加载时预拉取设备列表供选择
  deviceStore.fetchDevices();
});

onUnmounted(() => {
  stopPolling();
});

const startPolling = () => {
  if (!selectedDeviceId.value) {
    return;
  }
  // 启动 2s 一次的轮询，从后端获取最新实时数据
  polling.value = true;
  fetchData();
  pollingTimer = window.setInterval(() => {
    if (selectedDeviceId.value) {
      fetchData();
    }
  }, 2000);
};

const stopPolling = () => {
  polling.value = false;
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
};

const fetchData = async () => {
  if (selectedDeviceId.value) {
    // 与 README 中的 /api/devices/:id/realtime 保持一致
    await deviceStore.fetchRealtimeData(selectedDeviceId.value);
  }
};
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.data-content {
  padding: 10px;
}
</style>
