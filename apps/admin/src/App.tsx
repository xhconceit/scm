import { computed, defineComponent } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { ElContainer, ElHeader, ElMain, ElMenu, ElMenuItem } from 'element-plus';
import './App.css';

const NAV_ITEMS = [
  { label: '仪表盘', path: '/dashboard' },
  { label: '设备管理', path: '/devices' },
  { label: '实时数据', path: '/realtime' },
  { label: '系统设置', path: '/settings' },
] as const;

export default defineComponent({
  name: 'App',
  setup() {
    const route = useRoute();
    // 使用 computed 以响应式追踪当前路由路径，驱动顶栏菜单高亮
    const activeMenu = computed(() => route.path);

    return () => (
      <ElContainer class="app-container">
        <ElHeader class="app-header">
          <div class="header-content">
            <h1 class="app-title">SCM - 甘蔗收割机数据采集系统</h1>
            <ElMenu
              mode="horizontal"
              defaultActive={activeMenu.value}
              router
              class="header-menu"
            >
              {NAV_ITEMS.map((item) => (
                <ElMenuItem index={item.path} key={item.path}>
                  {item.label}
                </ElMenuItem>
              ))}
            </ElMenu>
          </div>
        </ElHeader>
        <ElMain class="app-main">
          {/* RouterView 渲染当前路由对应的页面组件 */}
          <RouterView />
        </ElMain>
      </ElContainer>
    );
  },
});
