import { computed, defineComponent } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import {
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NMenu,
  NSpace,
  NConfigProvider,
} from "naive-ui";
import type { MenuOption } from "naive-ui";
import "./App.css";

const NAV_ITEMS = [
  { label: "仪表盘", path: "/dashboard", key: "/dashboard" },
  { label: "实时数据", path: "/realtime", key: "/realtime" },
  { label: "系统设置", path: "/settings", key: "/settings" },
] as const;

export default defineComponent({
  name: "App",
  setup() {
    const route = useRoute();
    const router = useRouter();

    // 使用 computed 以响应式追踪当前路由路径，驱动顶栏菜单高亮
    const activeMenu = computed(() => route.path);

    // 创建菜单选项
    const menuOptions = computed<MenuOption[]>(() =>
      NAV_ITEMS.map((item) => ({
        label: item.label,
        key: item.key,
      }))
    );

    // 处理菜单点击
    const handleMenuUpdate = (key: string) => {
      router.push(key);
    };

    return () => (
      <NConfigProvider>
        <NLayout class="app-container" style={{ minHeight: "100vh" }}>
          <NLayoutHeader
            class="app-header"
            style={{
              padding: "0 24px",
              height: "64px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <NSpace
              justify="space-between"
              align="center"
              style={{ width: "100%" }}
            >
              <h1 class="app-title" style={{ margin: 0, fontSize: "20px" }}>
                SCM - 甘蔗收割机数据采集系统
              </h1>
              <NMenu
                mode="horizontal"
                value={activeMenu.value}
                options={menuOptions.value}
                onUpdateValue={handleMenuUpdate}
              />
            </NSpace>
          </NLayoutHeader>
          <NLayoutContent class="app-main" style={{ padding: "24px" }}>
            {/* RouterView 渲染当前路由对应的页面组件 */}
            <RouterView />
          </NLayoutContent>
        </NLayout>
      </NConfigProvider>
    );
  },
});
