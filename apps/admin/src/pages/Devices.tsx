import {
  defineComponent,
  onMounted,
  ref,
  h,
} from 'vue';
import { useRouter } from 'vue-router';
import {
  NButton,
  NDataTable,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NTag,
  NSpace,
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { message, dialog } from '../utils/naive';
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

    /**
     * 提交创建设备表单，成功后刷新列表并重置输入
     */
    const handleCreate = async () => {
      if (!newDevice.value.name.trim()) {
        message.warning('请输入设备名称');
        return;
      }
      const success = await deviceStore.createDevice({
        deviceId: newDevice.value.deviceId,
        name: newDevice.value.name,
      });
      if (success) {
        message.success('设备创建成功');
        showCreateDialog.value = false;
        newDevice.value = { deviceId: 1001, name: '' };
      } else {
        message.error('设备创建失败');
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
      dialog.warning({
        title: '提示',
        content: '确定要删除该设备吗？',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: async () => {
          const success = await deviceStore.deleteDevice(deviceId);
          if (success) {
            message.success('设备删除成功');
          } else {
            message.error('设备删除失败');
          }
        }
      });
    };

    const columns: DataTableColumns<Device> = [
      {
        title: '设备ID',
        key: 'deviceId',
        width: 120,
      },
      {
        title: '设备名称',
        key: 'name',
      },
      {
        title: '状态',
        key: 'status',
        width: 100,
        render: (row) =>
          h(
            NTag,
            { type: row.status === 'online' ? 'success' : 'default' },
            { default: () => (row.status === 'online' ? '在线' : '离线') }
          ),
      },
      {
        title: '创建时间',
        key: 'createdAt',
        width: 180,
        render: (row) => new Date(row.createdAt).toLocaleString(),
      },
      {
        title: '操作',
        key: 'actions',
        width: 200,
        render: (row) =>
          h(
            NSpace,
            {},
            {
              default: () => [
                h(
                  NButton,
                  { size: 'small', onClick: () => handleView(row.deviceId) },
                  { default: () => '查看' }
                ),
                h(
                  NButton,
                  { size: 'small', type: 'error', onClick: () => handleDelete(row.deviceId) },
                  { default: () => '删除' }
                ),
              ],
            }
          ),
      },
    ];

    return () => (
      <div class="devices">
        <div class="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>设备管理</h2>
          <NButton type="primary" onClick={() => (showCreateDialog.value = true)}>
            添加设备
          </NButton>
        </div>

        <NDataTable
          columns={columns}
          data={deviceStore.devices}
          loading={deviceStore.loading}
          striped
        />

        <NModal
          v-model:show={showCreateDialog.value}
          title="添加设备"
          preset="dialog"
          positiveText="确定"
          negativeText="取消"
          onPositiveClick={handleCreate}
          onNegativeClick={() => (showCreateDialog.value = false)}
        >
          <NForm model={newDevice.value} labelPlacement="left" labelWidth={100}>
            <NFormItem label="设备ID">
              <NInputNumber
                min={1}
                value={newDevice.value.deviceId}
                onUpdateValue={(value) => {
                  newDevice.value.deviceId = typeof value === 'number' ? value : 1001;
                }}
                style={{ width: '100%' }}
              />
            </NFormItem>
            <NFormItem label="设备名称">
              <NInput
                value={newDevice.value.name}
                onUpdateValue={(value) => {
                  newDevice.value.name = value ?? '';
                }}
              />
            </NFormItem>
          </NForm>
        </NModal>
      </div>
    );
  },
});
