import { computed, defineComponent, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElCard, ElCol, ElRow } from 'element-plus';
import DeviceCard from '../components/DeviceCard';
import { useDeviceStore } from '../stores/device';
import './Dashboard.css';

export default defineComponent({
  name: 'DashboardPage',
  setup() {
    const deviceStore = useDeviceStore();
    const router = useRouter();

    onMounted(() => {
      // 仪表盘加载时预取设备列表，以便统计卡片和下方列表同步数据
      deviceStore.fetchDevices();
    });

    const devices = computed(() => deviceStore.devices);
    const onlineCount = computed(
      () => devices.value.filter((device) => device.status === 'online').length
    );
    const offlineCount = computed(
      () => devices.value.filter((device) => device.status === 'offline').length
    );

    // 当用户从仪表盘点击设备卡片时跳转到设备详情页
    const handleDeviceSelect = (deviceId: number) => {
      router.push(`/devices/${deviceId}`);
    };

    return () => (
      <div class="dashboard">
        <ElRow gutter={20}>
          <ElCol span={24}>
            <h2>仪表盘</h2>
          </ElCol>
        </ElRow>

        <ElRow gutter={20} style={{ marginTop: '20px' }}>
          <ElCol span={6}>
            <ElCard v-slots={{ header: () => <span>设备总数</span> }}>
              <div class="stat-value">{devices.value.length}</div>
            </ElCard>
          </ElCol>
          <ElCol span={6}>
            <ElCard v-slots={{ header: () => <span>在线设备</span> }}>
              <div class="stat-value">{onlineCount.value}</div>
            </ElCard>
          </ElCol>
          <ElCol span={6}>
            <ElCard v-slots={{ header: () => <span>离线设备</span> }}>
              <div class="stat-value">{offlineCount.value}</div>
            </ElCard>
          </ElCol>
          <ElCol span={6}>
            <ElCard v-slots={{ header: () => <span>数据采集</span> }}>
              <div class="stat-value">正常</div>
            </ElCard>
          </ElCol>
        </ElRow>

        <ElRow gutter={20} style={{ marginTop: '20px' }}>
          <ElCol span={24}>
            <ElCard v-slots={{ header: () => <span>设备列表</span> }}>
              {devices.value.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onSelect={handleDeviceSelect}
                />
              ))}
            </ElCard>
          </ElCol>
        </ElRow>
      </div>
    );
  },
});
