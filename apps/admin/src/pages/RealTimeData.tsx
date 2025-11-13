import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
import {
  ElButton,
  ElCard,
  ElCol,
  ElDescriptions,
  ElDescriptionsItem,
  ElEmpty,
  ElOption,
  ElRow,
  ElSelect,
} from 'element-plus';
import ModuleStatus from '../components/ModuleStatus';
import { useDeviceStore } from '../stores/device';
import './RealTimeData.css';

export default defineComponent({
  name: 'RealTimeDataPage',
  setup() {
    const deviceStore = useDeviceStore();
    const selectedDeviceId = ref<number | null>(null);
    const polling = ref(false);
    let pollingTimer: ReturnType<typeof setInterval> | null = null;

    onMounted(() => {
      // 页面加载时即获取设备清单，方便用户直接选择
      deviceStore.fetchDevices();
    });

    onUnmounted(() => {
      stopPolling();
    });

    const fetchData = async () => {
      if (selectedDeviceId.value) {
        // 按 README 约定的 `/api/devices/:id/realtime` 接口获取实时数据
        await deviceStore.fetchRealtimeData(selectedDeviceId.value);
      }
    };

    const startPolling = () => {
      if (!selectedDeviceId.value) {
        return;
      }
      // 启动 2s 间隔轮询，以模拟实时数据流
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

    return () => (
      <div class="realtime-data">
        <ElRow gutter={20}>
          <ElCol span={24}>
            <h2>实时数据监控</h2>
          </ElCol>
        </ElRow>

        <ElRow gutter={20} style={{ marginTop: '20px' }}>
          <ElCol span={24}>
            <ElCard
              v-slots={{
                header: () => (
                  <div class="card-header">
                    <span>选择设备</span>
                    <ElSelect
                      placeholder="请选择设备"
                      modelValue={selectedDeviceId.value}
                      style={{ width: '200px' }}
                      onUpdate:modelValue={(value) => {
                        selectedDeviceId.value = typeof value === 'number' ? value : null;
                      }}
                    >
                      {deviceStore.devices.map((device) => (
                        <ElOption
                          key={device.id}
                          label={device.name}
                          value={device.deviceId}
                        />
                      ))}
                    </ElSelect>
                    <ElButton type="primary" onClick={startPolling} disabled={polling.value}>
                      开始监控
                    </ElButton>
                    <ElButton onClick={stopPolling} disabled={!polling.value}>
                      停止监控
                    </ElButton>
                  </div>
                ),
              }}
            >
              {deviceStore.realtimeData ? (
                <div class="data-content">
                  <ElDescriptions column={2} border>
                    <ElDescriptionsItem label="数据类型">
                      {deviceStore.realtimeData.type === 1 ? '类型一' : '类型二'}
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label="更新时间">
                      {new Date().toLocaleString()}
                    </ElDescriptionsItem>
                  </ElDescriptions>
                  <div style={{ marginTop: '20px' }}>
                    <h3>模块数据</h3>
                    <ModuleStatus modules={deviceStore.realtimeData.module} />
                  </div>
                </div>
              ) : (
                <ElEmpty description="请选择设备并开始监控" />
              )}
            </ElCard>
          </ElCol>
        </ElRow>
      </div>
    );
  },
});
