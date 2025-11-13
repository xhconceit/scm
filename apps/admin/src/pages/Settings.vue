<template>
  <div class="settings">
    <el-row :gutter="20">
      <el-col :span="24">
        <h2>系统设置</h2>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>MQTT 配置</span>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="Broker 地址">
              {{ mqttConfig.broker }}
            </el-descriptions-item>
            <el-descriptions-item label="端口">
              {{ mqttConfig.port }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag type="success">已连接</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>数据库配置</span>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="数据库类型">PostgreSQL</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag type="success">已连接</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 设置页暂时使用静态数据，展示 README 中的默认配置
const mqttConfig = ref({
  broker: 'mqtt://localhost',
  port: 1883,
});
</script>
