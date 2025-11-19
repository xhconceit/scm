import { defineComponent, ref } from "vue";
import { NCard, NDescriptions, NTag, NSpace } from "naive-ui";

export default defineComponent({
  name: "SettingsPage",
  setup() {
    // 设置页暂时使用静态数据，展示 README 中的默认配置
    return () => (
      <div class="settings">
      </div>
    );
  },
});
