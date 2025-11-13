<template>
  <div class="module-status">
    <el-row :gutter="10">
      <el-col :span="4" v-for="(value, index) in modules" :key="index">
        <el-card class="module-card">
          <div class="module-label">模块 {{ index + 1 }}</div>
          <div class="module-value" :class="{ active: value > 0 }">{{ value }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
/**
 * 模块状态展示组件，接收 18 个模块数值并以卡片形式展示
 */
defineProps<{
  modules: number[];
}>();
</script>

<style scoped>
.module-card {
  text-align: center;
  margin-bottom: 10px;
}

.module-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.module-value {
  font-size: 20px;
  font-weight: bold;
  color: #909399;
}

.module-value.active {
  color: #409eff;
}
</style>
