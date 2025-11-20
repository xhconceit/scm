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

const STORAGE_KEY = "app_settings";

export default defineComponent({
  name: "SettingsPage",
  setup() {
    const message = useMessage();
    const loading = ref(false);
    // 默认值需要正确初始化
    const data = ref<any[]>(JSON.parse(JSON.stringify(DEFAULT_CONFIG)));

    // 初始化时读取配置
    onMounted(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            data.value = parsed;
            return; // 成功加载缓存，直接返回
          }
        }
      } catch (e) {
        console.error("Failed to parse settings:", e);
      }
      // 如果没有缓存或缓存无效，使用默认值
      // 注意：上面初始化已经给了默认值，所以这里其实可以省略，
      // 但为了确保逻辑严密，如果缓存读取失败，强制覆盖回默认值也是安全的
      data.value = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    });

    const handleSave = async () => {
      loading.value = true;
      // 模拟异步保存
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.value));
        message.success("配置已保存");
      } catch (e) {
        message.error("保存失败");
        console.error(e);
      } finally {
        loading.value = false;
      }
    };

    const handleReset = () => {
      data.value = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
      localStorage.removeItem(STORAGE_KEY);
      message.success("配置已重置为默认值");
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
                      trigger: () => <NButton>重置默认</NButton>,
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
