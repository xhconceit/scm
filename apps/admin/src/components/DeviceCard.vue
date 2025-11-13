<template>
  <el-card class="device-card" @click="handleClick">
    <div class="card-content">
      <div class="device-info">
        <h3>{{ device.name }}</h3>
        <p>设备ID: {{ device.deviceId }}</p>
      </div>
      <div class="device-status">
        <el-tag :type="device.status === 'online' ? 'success' : 'info'">
          {{ device.status === 'online' ? '在线' : '离线' }}
        </el-tag>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { Device } from '../types';

const props = defineProps<{
  device: Device;
}>();

const emit = defineEmits<{
  select: [deviceId: number];
}>();

const handleClick = () => {
  emit('select', props.device.deviceId);
};
</script>

<style scoped>
.device-card {
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.device-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.device-info h3 {
  margin: 0 0 5px 0;
}

.device-info p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}
</style>
