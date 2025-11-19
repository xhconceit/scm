import { defineComponent } from "vue";
import "./RealTimeData.css";

export default defineComponent({
  name: "RealTimeDataPage",
  setup() {

    // const realtimeData = ref<RealtimeMessage | null>(null);

    return () => (
      <div class="realtime-data">
        <h2>实时数据监控</h2>
      </div>
    );
  },
});
