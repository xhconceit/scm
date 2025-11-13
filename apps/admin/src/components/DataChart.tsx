import { defineComponent, onBeforeUnmount, onMounted, PropType, ref, watch } from 'vue';
import * as echarts from 'echarts';
import './DataChart.css';

export default defineComponent({
  name: 'DataChart',
  props: {
    data: {
      type: Array as PropType<number[]>,
      required: true,
    },
    title: {
      type: String,
      default: '模块数据',
    },
  },
  setup(props) {
    const chartContainer = ref<HTMLDivElement | null>(null);
    let chartInstance: echarts.ECharts | null = null;

    // 将最新的数据集映射为折线图配置并渲染到图表实例上
    const updateChart = () => {
      if (!chartInstance || !props.data?.length) {
        return;
      }

      const option: echarts.EChartsOption = {
        title: {
          text: props.title,
          left: 'center',
        },
        tooltip: {
          trigger: 'axis',
        },
        xAxis: {
          type: 'category',
          data: props.data.map((_, index) => `模块 ${index + 1}`),
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data: props.data,
            type: 'line',
            smooth: true,
          },
        ],
      };

      chartInstance.setOption(option);
    };

    onMounted(() => {
      if (!chartContainer.value) {
        return;
      }
      chartInstance = echarts.init(chartContainer.value);
      updateChart();
    });

    watch(
      () => props.data,
      () => {
        // 监听数据变化后刷新图表，保持展示与后台数据同步
        updateChart();
      },
      { deep: true }
    );

    onBeforeUnmount(() => {
      chartInstance?.dispose();
      chartInstance = null;
    });

    return () => <div ref={chartContainer} class="chart-container" />;
  },
});
