<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="24">
        <h2>仪表盘</h2>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="6">
        <el-card>
          <template #header>
            <span>设备总数</span>
          </template>
          <div class="stat-value">{{ deviceStore.devices.length }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <template #header>
            <span>在线设备</span>
          </template>
          <div class="stat-value">
            {{ deviceStore.devices.filter((d) => d.status === 'online').length }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <template #header>
            <span>离线设备</span>
          </template>
          <div class="stat-value">
            {{ deviceStore.devices.filter((d) => d.status === 'offline').length }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <template #header>
            <span>数据采集</span>
          </template>
          <div class="stat-value">正常</div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>设备列表</span>
          </template>
          <DeviceCard
            v-for="device in deviceStore.devices"
            :key="device.id"
            :device="device"
            @select="handleDeviceSelect"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useDeviceStore } from '../stores/device';
import DeviceCard from '../components/DeviceCard.vue';
import { useRouter } from 'vue-router';

const deviceStore = useDeviceStore();
const router = useRouter();

onMounted(() => {
  deviceStore.fetchDevices();
});

const handleDeviceSelect = (deviceId: number) => {
  router.push(`/devices/${deviceId}`);
};
</script>

<style scoped>
.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  text-align: center;
}
</style>
