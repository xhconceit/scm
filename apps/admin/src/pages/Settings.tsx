import { defineComponent, ref } from 'vue';
import {
  ElCard,
  ElCol,
  ElDescriptions,
  ElDescriptionsItem,
  ElRow,
  ElTag,
} from 'element-plus';

export default defineComponent({
  name: 'SettingsPage',
  setup() {
    // 设置页暂时使用静态数据，展示 README 中的默认配置
    const mqttConfig = ref({
      broker: 'mqtt://localhost',
      port: 1883,
    });

    return () => (
      <div class="settings">
        <ElRow gutter={20}>
          <ElCol span={24}>
            <h2>系统设置</h2>
          </ElCol>
        </ElRow>

        <ElRow gutter={20} style={{ marginTop: '20px' }}>
          <ElCol span={24}>
            <ElCard v-slots={{ header: () => <span>MQTT 配置</span> }}>
              <ElDescriptions column={1} border>
                <ElDescriptionsItem label="Broker 地址">
                  {mqttConfig.value.broker}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="端口">{mqttConfig.value.port}</ElDescriptionsItem>
                <ElDescriptionsItem label="状态">
                  <ElTag type="success">已连接</ElTag>
                </ElDescriptionsItem>
              </ElDescriptions>
            </ElCard>
          </ElCol>
        </ElRow>

        <ElRow gutter={20} style={{ marginTop: '20px' }}>
          <ElCol span={24}>
            <ElCard v-slots={{ header: () => <span>数据库配置</span> }}>
              <ElDescriptions column={1} border>
                <ElDescriptionsItem label="数据库类型">PostgreSQL</ElDescriptionsItem>
                <ElDescriptionsItem label="状态">
                  <ElTag type="success">已连接</ElTag>
                </ElDescriptionsItem>
              </ElDescriptions>
            </ElCard>
          </ElCol>
        </ElRow>
      </div>
    );
  },
});
