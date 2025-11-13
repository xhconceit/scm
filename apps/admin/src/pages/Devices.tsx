import {
  defineComponent,
  onMounted,
  ref,
  resolveDirective,
  withDirectives,
} from 'vue';
import { useRouter } from 'vue-router';
import {
  ElButton,
  ElCol,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElMessageBox,
  ElRow,
  ElTable,
  ElTableColumn,
  ElTag,
} from 'element-plus';
import { useDeviceStore } from '../stores/device';
import type { Device } from '../types';
import './Devices.css';

export default defineComponent({
  name: 'DevicesPage',
  setup() {
    const router = useRouter();
    const deviceStore = useDeviceStore();
    const showCreateDialog = ref(false);
    // 默认从 1001 开始，便于演示 README 中的样例
    const newDevice = ref<{ deviceId: number; name: string }>({ deviceId: 1001, name: '' });

    onMounted(() => {
      // 页面加载时立即获取设备数据，确保列表是最新状态
      deviceStore.fetchDevices();
    });

    const closeDialog = (value: boolean) => {
      showCreateDialog.value = value;
    };

    /**
     * 提交创建设备表单，成功后刷新列表并重置输入
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
     * 删除设备前弹窗确认，避免误操作
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
        // 用户取消操作时不做处理
      }
    };

    return () => {
      const loadingDirective = resolveDirective('loading');
      let tableVNode = (
        <ElTable data={deviceStore.devices} stripe class="device-table">
          <ElTableColumn prop="deviceId" label="设备ID" width={120} />
          <ElTableColumn prop="name" label="设备名称" />
          <ElTableColumn
            prop="status"
            label="状态"
            width={100}
            v-slots={{
              default: ({ row }: { row: Device }) => (
                <ElTag type={row.status === 'online' ? 'success' : 'info'}>
                  {row.status === 'online' ? '在线' : '离线'}
                </ElTag>
              ),
            }}
          />
          <ElTableColumn
            prop="createdAt"
            label="创建时间"
            width={180}
            v-slots={{
              default: ({ row }: { row: Device }) => new Date(row.createdAt).toLocaleString(),
            }}
          />
          <ElTableColumn
            label="操作"
            width={200}
            v-slots={{
              default: ({ row }: { row: Device }) => (
                <>
                  <ElButton size="small" onClick={() => handleView(row.deviceId)}>
                    查看
                  </ElButton>
                  <ElButton
                    size="small"
                    type="danger"
                    onClick={() => handleDelete(row.deviceId)}
                  >
                    删除
                  </ElButton>
                </>
              ),
            }}
          />
        </ElTable>
      );

      if (loadingDirective) {
        tableVNode = withDirectives(tableVNode, [[loadingDirective, deviceStore.loading]]);
      }

      return (
        <div class="devices">
          <ElRow gutter={20}>
            <ElCol span={24}>
              <div class="page-header">
                <h2>设备管理</h2>
                <ElButton type="primary" onClick={() => (showCreateDialog.value = true)}>
                  添加设备
                </ElButton>
              </div>
            </ElCol>
          </ElRow>

          <ElRow gutter={20} style={{ marginTop: '20px' }}>
            <ElCol span={24}>{tableVNode}</ElCol>
          </ElRow>

          <ElDialog
            modelValue={showCreateDialog.value}
            title="添加设备"
            width="500px"
            onUpdate:modelValue={closeDialog}
            v-slots={{
              footer: () => (
                <>
                  <ElButton onClick={() => (showCreateDialog.value = false)}>取消</ElButton>
                  <ElButton type="primary" onClick={handleCreate}>
                    确定
                  </ElButton>
                </>
              ),
            }}
          >
            <ElForm model={newDevice.value} labelWidth="100px">
              <ElFormItem label="设备ID">
                <ElInputNumber
                  min={1}
                  valueOnClear={1001}
                  modelValue={newDevice.value.deviceId}
                  onUpdate:modelValue={(value) => {
                    newDevice.value.deviceId = typeof value === 'number' ? value : 1001;
                  }}
                />
              </ElFormItem>
              <ElFormItem label="设备名称">
                <ElInput
                  modelValue={newDevice.value.name}
                  onUpdate:modelValue={(value) => {
                    newDevice.value.name = value ?? '';
                  }}
                />
              </ElFormItem>
            </ElForm>
          </ElDialog>
        </div>
      );
    };
  },
});
