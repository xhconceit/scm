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

export default defineComponent({
  name: "SettingsPage",
  setup() {
    const message = useMessage();
    const loading = ref(false);
    // 初始化为空数组，等待从服务器加载配置
    const data = ref<any[]>([]);

    // 初始化时读取配置
    onMounted(async () => {
      try {
        loading.value = true;
        const res = await sensorApi.getConfigs();
        if (res.data.success && res.data.data && res.data.data.length > 0) {
          data.value = res.data.data;
        } else {
          // 如果后端没有数据，保持空数组
          data.value = [];
        }
      } catch (e) {
        console.error("Failed to fetch settings:", e);
        message.error("获取配置失败");
        // 保持空数组
        data.value = [];
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
        // 清空所有配置
        data.value = [];
        
        // 保存空配置到服务器（实际上可能需要删除所有配置）
        const res = await sensorApi.saveConfigs([]);
        if (res.data.success) {
          message.success("配置已清空");
        } else {
          message.error("清空失败: " + res.data.message);
        }
      } catch (e) {
        message.error("清空失败");
        console.error(e);
      } finally {
        loading.value = false;
      }
    };

    const handleAddModule = () => {
      // 找到下一个可用的 type 编号
      const maxType = data.value.reduce((max, item) => Math.max(max, item.type), 0);
      const newModule = {
        type: maxType + 1,
        name: `模块 ${maxType + 1}`,
        module: Array(19).fill(""), // 19个空通道
      };
      data.value.push(newModule);
      message.info("已添加新模块，请配置后保存");
    };

    const handleDeleteModule = (index: number) => {
      data.value.splice(index, 1);
      message.info("已删除模块，请保存更改");
    };

    return () => (
      <div class="settings" style="padding: 24px;">
        <NSpace vertical size="large">
          <NCard title="配置管理">
            {{
              "header-extra": () => (
                <NSpace>
                  <NButton onClick={handleAddModule} disabled={loading.value}>
                    添加模块
                  </NButton>
                  <NPopconfirm onPositiveClick={handleReset}>
                    {{
                      trigger: () => (
                        <NButton disabled={loading.value}>清空配置</NButton>
                      ),
                      default: () =>
                        "确认要清空所有配置吗？此操作不可恢复。",
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
                  {data.value.length === 0 && (
                    <div style="text-align: center; padding: 40px; color: #999;">
                      暂无配置，请点击"添加模块"按钮添加模块配置。
                    </div>
                  )}
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
                            <NTag type="info">
                              类型: {item.type}
                            </NTag>
                            <NPopconfirm
                              onPositiveClick={() => handleDeleteModule(index)}
                            >
                              {{
                                trigger: () => (
                                  <NButton
                                    type="error"
                                    size="small"
                                    style="margin-left: auto;"
                                  >
                                    删除
                                  </NButton>
                                ),
                                default: () => "确认删除此模块配置吗？",
                              }}
                            </NPopconfirm>
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
