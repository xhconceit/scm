import { defineComponent, reactive, computed } from "vue";
import { NGrid, NGridItem, NCard, NDatePicker } from "naive-ui";
import DataChart, { ChartSeries } from "../components/DataChart";
import "./Dashboard.css";

interface ConfigItem {
  type: number;
  name: string;
  module: string[];
}

interface DataItem {
  type: number;
  module: number[];
  timestamp: number;
}

export default defineComponent({
  name: "DashboardPage",
  setup() {
    // 配置数据
    const config: ConfigItem[] = [
      {
        type: 1,
        name: "模块一",
        module: [
          "电流",
          "电压",
          "温度",
          "湿度",
          "压力",
          "转速",
          "振动",
          "流量",
          "液位",
          "功率",
          "频率",
        ],
      },
    ];

    // 生成随机数
    const random = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    // 当前时间基准
    const now = Date.now();
    const ONE_MINUTE = 60 * 1000;

    // 生成模拟数据 (模拟20条记录，每分钟一条)
    const dataList: DataItem[] = Array.from({ length: 20 }).map((_, i) => ({
      type: 1,
      timestamp: now - (20 - i) * ONE_MINUTE,
      module: [
        random(0, 10), // 电流: 0-10
        random(210, 230), // 电压: 210-230
        random(30, 60), // 温度: 30-60
        random(40, 80), // 湿度: 40-80
        random(0, 5), // 压力
        random(1000, 1200), // 转速
        random(0, 100) / 10, // 振动
        random(10, 20), // 流量
        random(50, 90), // 液位
        random(100, 500), // 功率
        random(49, 51), // 频率
      ],
    }));

    // 存储每个模块类型的时间筛选范围
    // Key: type, Value: [start, end] | null
    const timeFilters = reactive<Record<number, [number, number] | null>>({});

    // 处理数据
    // 需求：有11个数据应该是有11条线
    // Series: 对应 module 数组的每一个索引 (11条线)
    // X轴: 对应数据记录的变化 (时间轴)
    const charts = computed(() => {
      const result: {
        type: number;
        title: string;
        series: ChartSeries[];
        xAxisData: string[];
      }[] = [];

      // 1. 找出所有出现的 type
      const types = Array.from(new Set(dataList.map((d) => d.type)));

      types.forEach((type) => {
        const typeConfig = config.find((c) => c.type === type);
        // 获取当前模块的时间筛选范围
        const filterRange = timeFilters[type];

        // 过滤数据
        const typeDataList = dataList.filter((d) => {
          if (d.type !== type) return false;
          if (filterRange) {
            return (
              d.timestamp >= filterRange[0] && d.timestamp <= filterRange[1]
            );
          }
          return true;
        });

        if (!typeConfig || typeDataList.length === 0) {
          // 即使被过滤空了，也要保留 Card 框架以便用户清除筛选，
          // 但这里如果 completely empty (no config) 就算了。
          // 如果只是过滤结果为空，应该展示空图表而不是消失。
          if (typeConfig) {
            // 空数据展示逻辑
          } else {
            return;
          }
        }

        // 2. 准备 Series
        const series: ChartSeries[] = typeConfig.module.map((name, index) => {
          const channelData = typeDataList.map(
            (item) => item.module[index] || 0
          );
          return {
            name: name || `通道 ${index + 1}`,
            data: channelData,
          };
        });

        // 3. 准备 X 轴：格式化时间戳
        const xAxisData = typeDataList.map((item) => {
          const date = new Date(item.timestamp);
          return `${date.getHours().toString().padStart(2, "0")}:${date
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
        });

        result.push({
          type: type,
          title: typeConfig.name,
          series,
          xAxisData,
        });
      });

      return result;
    });

    const handleDateUpdate = (type: number, value: [number, number] | null) => {
      timeFilters[type] = value;
    };

    return () => (
      <div class="dashboard-container">
        <NGrid x-gap={12} y-gap={12} cols="1" responsive="screen">
          {charts.value.map((chart) => (
            <NGridItem key={chart.type}>
              <NCard title={chart.title}>
                {{
                  "header-extra": () => (
                    <NDatePicker
                      value={timeFilters[chart.type]}
                      type="datetimerange"
                      clearable
                      onUpdateValue={(val) => handleDateUpdate(chart.type, val)}
                      style={{ width: "340px" }}
                    />
                  ),
                  default: () => (
                    <DataChart
                      series={chart.series}
                      xAxisData={chart.xAxisData}
                      title={chart.title + " 趋势图"}
                    />
                  ),
                }}
              </NCard>
            </NGridItem>
          ))}
        </NGrid>
      </div>
    );
  },
});
