import { defineComponent, ref, onMounted } from "vue";
import {
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NSpace,
  NInput,
  NButton,
  useMessage,
  NPopconfirm,
} from "naive-ui";
import { sensorApi } from "../api/sensor";

const DEFAULT_CONFIG = [
  {
    type: 1,
    name: "模块一",
    module: [
      "电流",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
  },
];

export default defineComponent({
  name: "SettingsPage",
  setup() {
    const message = useMessage();
    const loading = ref(false);
    // 默认值需要正确初始化
    const data = ref<any[]>(JSON.parse(JSON.stringify(DEFAULT_CONFIG)));

    // 初始化时读取配置
    onMounted(async () => {
      try {
        loading.value = true;
        const res = await sensorApi.getConfigs();
        if (res.data.success && res.data.data && res.data.data.length > 0) {
          data.value = res.data.data;
        } else {
          // 如果后端没有数据（第一次启动），使用默认值
          data.value = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        }
      } catch (e) {
        console.error("Failed to fetch settings:", e);
        message.error("获取配置失败");
        // 保持默认值
      } finally {
        loading.value = false;
      }
    });

    const handleSave = async () => {
      loading.value = true;
      try {
        const res = await sensorApi.saveConfigs(data.value);
        if (res.data.success) {
          message.success("配置已保存");
        } else {
          message.error(res.data.message || "保存失败");
        }
      } catch (e) {
        message.error("保存失败");
        console.error(e);
      } finally {
        loading.value = false;
      }
    };

    const handleReset = async () => {
      loading.value = true;
      try {
        const defaultConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        data.value = defaultConfig;

        // 重置时直接保存默认值到服务器
        const res = await sensorApi.saveConfigs(defaultConfig);
        if (res.data.success) {
          message.success("配置已重置为默认值");
        } else {
          message.error("重置失败: " + res.data.message);
        }
      } catch (e) {
        message.error("重置失败");
        console.error(e);
      } finally {
        loading.value = false;
      }
    };

    return () => (
      <div class="settings" style="padding: 24px;">
        <NSpace vertical size="large">
          <NCard title="配置管理">
            {{
              "header-extra": () => (
                <NSpace>
                  <NPopconfirm onPositiveClick={handleReset}>
                    {{
                      trigger: () => (
                        <NButton disabled={loading.value}>重置默认</NButton>
                      ),
                      default: () =>
                        "确认要重置所有配置为默认值吗？此操作不可恢复。",
                    }}
                  </NPopconfirm>
                  <NButton
                    type="primary"
                    onClick={handleSave}
                    loading={loading.value}
                  >
                    保存配置
                  </NButton>
                </NSpace>
              ),
              default: () => (
                <NSpace vertical size="large">
                  {data.value.map((item: any, index: number) => (
                    <NCard key={index} size="medium" bordered>
                      {{
                        header: () => (
                          <div style="display: flex; align-items: center; gap: 12px;">
                            <span>模块名称:</span>
                            <NInput
                              v-model:value={item.name}
                              placeholder="请输入模块名称"
                              style="width: 200px"
                            />
                            <NTag type="info" style="margin-left: auto;">
                              类型: {item.type}
                            </NTag>
                          </div>
                        ),
                        default: () => (
                          <NSpace vertical size="medium">
                            <NDescriptions
                              bordered
                              label-placement="top"
                              column={4}
                              title="通道数据名称配置"
                            >
                              {item.module.map((_: any, idx: number) => (
                                <NDescriptionsItem
                                  key={idx}
                                  label={`通道 ${idx + 1}`}
                                >
                                  <NInput
                                    v-model:value={item.module[idx]}
                                    placeholder="未配置"
                                  />
                                </NDescriptionsItem>
                              ))}
                            </NDescriptions>
                          </NSpace>
                        ),
                      }}
                    </NCard>
                  ))}
                </NSpace>
              ),
            }}
          </NCard>
        </NSpace>
      </div>
    );
  },
});
