import { defineComponent, ref } from 'vue';
import {
  NCard,
  NDescriptions,
  NTag,
  NSpace,
} from 'naive-ui';

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
        <h2>系统设置</h2>

        <NSpace vertical size="large" style={{ marginTop: '20px' }}>
          <NCard title="MQTT 配置">
            <NDescriptions column={1} bordered>
              {{
                default: () => [
                  <NDescriptions.DescriptionsItem label="Broker 地址">
                    {mqttConfig.value.broker}
                  </NDescriptions.DescriptionsItem>,
                  <NDescriptions.DescriptionsItem label="端口">
                    {mqttConfig.value.port}
                  </NDescriptions.DescriptionsItem>,
                  <NDescriptions.DescriptionsItem label="状态">
                    <NTag type="success">已连接</NTag>
                  </NDescriptions.DescriptionsItem>,
                ],
              }}
            </NDescriptions>
          </NCard>

          <NCard title="数据库配置">
            <NDescriptions column={1} bordered>
              {{
                default: () => [
                  <NDescriptions.DescriptionsItem label="数据库类型">
                    PostgreSQL
                  </NDescriptions.DescriptionsItem>,
                  <NDescriptions.DescriptionsItem label="状态">
                    <NTag type="success">已连接</NTag>
                  </NDescriptions.DescriptionsItem>,
                ],
              }}
            </NDescriptions>
          </NCard>
        </NSpace>
      </div>
    );
  },
});
