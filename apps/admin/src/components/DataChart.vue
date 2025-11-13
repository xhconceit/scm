<template>
  <div ref="chartContainer" class="chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps<{
  data: number[];
  title?: string;
}>();

const chartContainer = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

onMounted(() => {
  if (chartContainer.value) {
    chart = echarts.init(chartContainer.value);
    updateChart();
  }
});

watch(
  () => props.data,
  () => {
    // 数据更新时同步刷新图表
    updateChart();
  },
  { deep: true }
);

const updateChart = () => {
  if (!chart || !props.data) return;

  const option = {
    title: {
      text: props.title || '模块数据',
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

  chart.setOption(option);
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
}
</style>
