<template>
  <div class="devices">
    <el-row :gutter="20">
      <el-col :span="24">
        <div class="page-header">
          <h2>设备管理</h2>
          <el-button type="primary" @click="showCreateDialog = true">添加设备</el-button>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-table :data="deviceStore.devices" v-loading="deviceStore.loading" stripe>
          <el-table-column prop="deviceId" label="设备ID" width="120" />
          <el-table-column prop="name" label="设备名称" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'online' ? 'success' : 'info'">
                {{ row.status === 'online' ? '在线' : '离线' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="{ row }">
              {{ new Date(row.createdAt).toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button size="small" @click="handleView(row.deviceId)">查看</el-button>
              <el-button size="small" type="danger" @click="handleDelete(row.deviceId)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <!-- 创建设备对话框 -->
    <el-dialog v-model="showCreateDialog" title="添加设备" width="500px">
      <el-form :model="newDevice" label-width="100px">
        <el-form-item label="设备ID">
          <el-input-number v-model="newDevice.deviceId" :min="1" />
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input v-model="newDevice.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDeviceStore } from '../stores/device';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';

const deviceStore = useDeviceStore();
const router = useRouter();
const showCreateDialog = ref(false);
// 默认从 1001 开始，便于演示 README 中的样例
const newDevice = ref({ deviceId: 1001, name: '' });

onMounted(() => {
  // 打开页面时即加载设备列表
  deviceStore.fetchDevices();
});

/**
 * 提交创建设备表单，成功后刷新列表并重置表单
 */
const handleCreate = async () => {
  if (!newDevice.value.name.trim()) {
    ElMessage.warning('请输入设备名称');
    return;
  }
  const success = await deviceStore.createDevice({
    deviceId: newDevice.value.deviceId,
    name: newDevice.value.name,
  });
  if (success) {
    ElMessage.success('设备创建成功');
    showCreateDialog.value = false;
    newDevice.value = { deviceId: 1001, name: '' };
  } else {
    ElMessage.error('设备创建失败');
  }
};

/**
 * 跳转到设备详情页，保持与 README 提供的导航一致
 */
const handleView = (deviceId: number) => {
  router.push(`/devices/${deviceId}`);
};

/**
 * 删除设备前弹出确认框，删除成功后刷新数据
 */
const handleDelete = async (deviceId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该设备吗？', '提示', {
      type: 'warning',
    });
    const success = await deviceStore.deleteDevice(deviceId);
    if (success) {
      ElMessage.success('设备删除成功');
    } else {
      ElMessage.error('设备删除失败');
    }
  } catch {
    // 用户取消
  }
};
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
