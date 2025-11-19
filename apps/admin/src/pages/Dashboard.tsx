import { computed, defineComponent, onMounted } from "vue";
import { useRouter } from "vue-router";
import { NCard, NGrid, NGridItem, NSpace } from "naive-ui";
import DeviceCard from "../components/DeviceCard";
import { useDeviceStore } from "../stores/device";
import "./Dashboard.css";

export default defineComponent({
  name: "DashboardPage",
  setup() {
    const deviceStore = useDeviceStore();
    const router = useRouter();

    onMounted(() => {
      // 仪表盘加载时预取设备列表，以便统计卡片和下方列表同步数据
      deviceStore.fetchDevices();
    });

    const devices = computed(() => deviceStore.devices);
    const onlineCount = computed(
      () => devices.value.filter((device) => device.status === "online").length
    );
    const offlineCount = computed(
      () => devices.value.filter((device) => device.status === "offline").length
    );

    // 当用户从仪表盘点击设备卡片时跳转到设备详情页
    const handleDeviceSelect = (deviceId: number) => {
      router.push(`/devices/${deviceId}`);
    };

    return () => (
      <div class="dashboard">
        <h2>仪表盘</h2>

        <NGrid cols={4} xGap={20} style={{ marginTop: "20px" }}>
          <NGridItem>
            <NCard title="设备总数">
              <div class="stat-value">{devices.value.length}</div>
            </NCard>
          </NGridItem>
          <NGridItem>
            <NCard title="在线设备">
              <div class="stat-value">{onlineCount.value}</div>
            </NCard>
          </NGridItem>
          <NGridItem>
            <NCard title="离线设备">
              <div class="stat-value">{offlineCount.value}</div>
            </NCard>
          </NGridItem>
          <NGridItem>
            <NCard title="数据采集">
              <div class="stat-value">正常</div>
            </NCard>
          </NGridItem>
        </NGrid>

        <NCard title="设备列表" style={{ marginTop: "20px" }}>
          <NSpace vertical>
            {devices.value.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onSelect={handleDeviceSelect}
              />
            ))}
          </NSpace>
        </NCard>
      </div>
    );
  },
});
