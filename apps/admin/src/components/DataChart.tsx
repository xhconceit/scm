import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  watch,
} from "vue";
import * as echarts from "echarts";
import "./DataChart.css";

export interface ChartSeries {
  name: string;
  data: number[];
}

export default defineComponent({
  name: "DataChart",
  props: {
    series: {
      type: Array as PropType<ChartSeries[]>,
      required: true,
    },
    xAxisData: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    title: {
      type: String,
      default: "数据趋势",
    },
  },
  setup(props) {
    const chartContainer = ref<HTMLDivElement | null>(null);
    let chartInstance: echarts.ECharts | null = null;

    const updateChart = () => {
      if (!chartInstance || !props.series?.length) {
        return;
      }

      const option: echarts.EChartsOption = {
        title: {
          text: props.title,
          left: "center",
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: props.series.map((s) => s.name),
          bottom: 0,
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "10%", // 留出图例空间
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: props.xAxisData,
        },
        yAxis: {
          type: "value",
        },
        series: props.series.map((s) => ({
          name: s.name,
          type: "line",
          data: s.data,
          smooth: true,
        })),
      };

      chartInstance.setOption(option, true); // true to merge = false (replace)
    };

    onMounted(() => {
      if (!chartContainer.value) {
        return;
      }
      chartInstance = echarts.init(chartContainer.value);
      updateChart();

      // 添加 resize 监听
      window.addEventListener("resize", () => chartInstance?.resize());
    });

    watch(
      [() => props.series, () => props.xAxisData],
      () => {
        updateChart();
      },
      { deep: true }
    );

    onBeforeUnmount(() => {
      window.removeEventListener("resize", () => chartInstance?.resize());
      chartInstance?.dispose();
      chartInstance = null;
    });

    return () => <div ref={chartContainer} class="chart-container" />;
  },
});
