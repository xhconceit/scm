<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-content">
        <h1 class="app-title">SCM - 甘蔗收割机数据采集系统</h1>
        <el-menu
          mode="horizontal"
          :default-active="activeMenu"
          router
          class="header-menu"
        >
          <el-menu-item index="/dashboard">仪表盘</el-menu-item>
          <el-menu-item index="/devices">设备管理</el-menu-item>
          <el-menu-item index="/realtime">实时数据</el-menu-item>
          <el-menu-item index="/settings">系统设置</el-menu-item>
        </el-menu>
      </div>
    </el-header>
    <el-main class="app-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
// 将当前路由同步到顶栏导航的激活状态
const activeMenu = computed(() => route.path);
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.app-header {
  background-color: #409eff;
  color: white;
  padding: 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
}

.app-title {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
}

.header-menu {
  background-color: transparent;
  border-bottom: none;
}

.header-menu :deep(.el-menu-item) {
  color: white;
}

.header-menu :deep(.el-menu-item.is-active) {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.app-main {
  padding: 20px;
  background-color: #f5f5f5;
}
</style>
