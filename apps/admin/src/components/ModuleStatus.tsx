import { defineComponent, PropType } from 'vue';
import { ElCard, ElCol, ElRow } from 'element-plus';
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
        <ElRow gutter={10}>
          {/* 逐个模块渲染卡片，展示当前模块的实时数值 */}
          {props.modules.map((value, index) => (
            <ElCol span={4} key={index}>
              <ElCard class="module-card">
                <div class="module-label">模块 {index + 1}</div>
                <div class={['module-value', { active: value > 0 }]}>
                  {value}
                </div>
              </ElCard>
            </ElCol>
          ))}
        </ElRow>
      </div>
    );
  },
});
