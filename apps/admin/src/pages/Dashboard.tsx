import { defineComponent, reactive, computed, ref, onMounted } from "vue";
import {
  NGrid,
  NGridItem,
  NCard,
  NDatePicker,
  useMessage,
  NSpin,
} from "naive-ui";
import DataChart, { ChartSeries } from "../components/DataChart";
import { sensorApi, ConfigItem, DataItem } from "../api/sensor";
import "./Dashboard.css";

export default defineComponent({
  name: "DashboardPage",
  setup() {
    const message = useMessage();
    const config = ref<ConfigItem[]>([]);
    const chartDataMap = reactive<Record<number, DataItem[]>>({});
    const loadingMap = reactive<Record<number, boolean>>({});

    // 存储每个模块类型的时间筛选范围
    // Key: type, Value: [start, end] | null
    const timeFilters = reactive<Record<number, [number, number] | null>>({});

    // 获取数据
    const fetchData = async (type: number, start?: number, end?: number) => {
      // 默认查询最近一小时
      const endTime = end || Date.now();
      const startTime = start || endTime - 60 * 60 * 1000;

      loadingMap[type] = true;
      try {
        const res = await sensorApi.getHistory({
          type,
          start: startTime,
          end: endTime,
        });
        if (res.data.success) {
          // 按时间排序，防止后端返回乱序（虽然后端已排，前端兜底）
          chartDataMap[type] = res.data.data.sort(
            (a, b) => a.timestamp - b.timestamp
          );
        }
      } catch (e) {
        console.error(e);
        message.error("获取数据失败");
      } finally {
        loadingMap[type] = false;
      }
    };

    onMounted(async () => {
      try {
        const res = await sensorApi.getConfigs();
        if (res.data.success && res.data.data.length > 0) {
          config.value = res.data.data;

          // 初始化每个图表的数据（默认最近1小时）
          config.value.forEach((c) => {
            const end = Date.now();
            const start = end - 60 * 60 * 1000;
            // 初始化筛选器显示，让用户知道当前看的是什么时间段
            timeFilters[c.type] = [start, end];
            fetchData(c.type, start, end);
          });
        }
      } catch (e) {
        console.error(e);
        message.error("获取配置失败");
      }
    });

    const charts = computed(() => {
      // 遍历配置，生成图表数据
      // 即使没有数据，也要根据配置生成空图表框架
      return config.value.map((c) => {
        const typeDataList = chartDataMap[c.type] || [];

        // 准备 Series
        const series: ChartSeries[] = c.module.map((name, index) => {
          const channelData = typeDataList.map(
            (item) => item.module[index] || 0
          );
          return {
            name: name || `通道 ${index + 1}`,
            data: channelData,
          };
        });

        // 准备 X 轴
        const xAxisData = typeDataList.map((item) => {
          const date = new Date(item.timestamp);
          return `${date.getHours().toString().padStart(2, "0")}:${date
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
        });

        return {
          type: c.type,
          title: c.name,
          series,
          xAxisData,
        };
      });
    });

    const handleDateUpdate = (type: number, value: [number, number] | null) => {
      timeFilters[type] = value;
      if (value) {
        fetchData(type, value[0], value[1]);
      } else {
        // 如果清空，默认恢复到最近一小时
        const end = Date.now();
        const start = end - 60 * 60 * 1000;
        fetchData(type, start, end);
      }
    };

    return () => (
      <div class="dashboard-container">
        <NGrid x-gap={12} y-gap={12} cols="1" responsive="screen">
          {charts.value.map((chart) => (
            <NGridItem key={chart.type}>
              <NSpin show={loadingMap[chart.type]}>
                <NCard title={chart.title}>
                  {{
                    "header-extra": () => (
                      <NDatePicker
                        value={timeFilters[chart.type]}
                        type="datetimerange"
                        clearable
                        onUpdateValue={(val) =>
                          handleDateUpdate(chart.type, val)
                        }
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
              </NSpin>
            </NGridItem>
          ))}
          {config.value.length === 0 && (
            <div style="text-align: center; padding: 40px; color: #999;">
              暂无配置，请前往设置页面添加模块配置。
            </div>
          )}
        </NGrid>
      </div>
    );
  },
});
