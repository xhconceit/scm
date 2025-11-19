import { defineComponent, PropType } from 'vue';
import { NCard, NGrid, NGridItem } from 'naive-ui';
import './ModuleStatus.css';

export default defineComponent({
  name: 'ModuleStatus',
  props: {
    modules: {
      type: Array as PropType<number[]>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <div class="module-status">
        <NGrid cols={6} xGap={10}>
          {/* 逐个模块渲染卡片，展示当前模块的实时数值 */}
          {props.modules.map((value, index) => (
            <NGridItem key={index}>
              <NCard class="module-card" size="small">
                <div class="module-label">模块 {index + 1}</div>
                <div class={['module-value', { active: value > 0 }]}>
                  {value}
                </div>
              </NCard>
            </NGridItem>
          ))}
        </NGrid>
      </div>
    );
  },
});
