import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
import {
  NButton,
  NCard,
  NDescriptions,
  NEmpty,
  NSelect,
  NSpace,
} from 'naive-ui';
import type { SelectOption } from 'naive-ui';
import ModuleStatus from '../components/ModuleStatus';
import { useDeviceStore } from '../stores/device';
import './RealTimeData.css';

export default defineComponent({
  name: 'RealTimeDataPage',
  setup() {
    const deviceStore = useDeviceStore();
    const selectedDeviceId = ref<number | null>(null);
    const polling = ref(false);
    const deviceOptions = ref<SelectOption[]>([]);
    let pollingTimer: number | null = null;

    // 将设备列表转换为选择器选项
    const updateDeviceOptions = () => {
      deviceOptions.value = deviceStore.devices.map((device) => ({
        label: device.name,
        value: device.deviceId,
      }));
    };

    onMounted(() => {
      // 页面加载时即获取设备清单，方便用户直接选择
      deviceStore.fetchDevices().then(() => {
        updateDeviceOptions();
      });
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
      if (pollingTimer !== null) {
        window.clearInterval(pollingTimer);
        pollingTimer = null;
      }
    };

    return () => (
      <div class="realtime-data">
        <h2>实时数据监控</h2>

        <NCard style={{ marginTop: '20px' }}>
          {{
            header: () => (
              <NSpace align="center">
                <span>选择设备</span>
                <NSelect
                  placeholder="请选择设备"
                  value={selectedDeviceId.value}
                  options={deviceOptions.value}
                  style={{ width: '200px' }}
                  onUpdateValue={(value) => {
                    selectedDeviceId.value = typeof value === 'number' ? value : null;
                  }}
                />
                <NButton type="primary" onClick={startPolling} disabled={polling.value}>
                  开始监控
                </NButton>
                <NButton onClick={stopPolling} disabled={!polling.value}>
                  停止监控
                </NButton>
              </NSpace>
            ),
            default: () =>
              deviceStore.realtimeData ? (
                <div class="data-content">
                  <NDescriptions column={2} bordered>
                    {{
                      default: () => [
                        <NDescriptions.DescriptionsItem label="数据类型">
                          {deviceStore.realtimeData?.type === 1 ? '类型一' : '类型二'}
                        </NDescriptions.DescriptionsItem>,
                        <NDescriptions.DescriptionsItem label="更新时间">
                          {new Date().toLocaleString()}
                        </NDescriptions.DescriptionsItem>,
                      ],
                    }}
                  </NDescriptions>
                  <div style={{ marginTop: '20px' }}>
                    <h3>模块数据</h3>
                    <ModuleStatus modules={deviceStore.realtimeData.module} />
                  </div>
                </div>
              ) : (
                <NEmpty description="请选择设备并开始监控" />
              ),
          }}
        </NCard>
      </div>
    );
  },
});
