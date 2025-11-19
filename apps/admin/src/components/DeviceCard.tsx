import { defineComponent, PropType } from 'vue';
import { NCard, NTag } from 'naive-ui';
import { Device } from '../types';
import './DeviceCard.css';

export default defineComponent({
  name: 'DeviceCard',
  props: {
    device: {
      type: Object as PropType<Device>,
      required: true,
    },
  },
  emits: {
    select: (deviceId: number) => typeof deviceId === 'number',
  },
  setup(props, { emit }) {
    // 点击卡片时向父组件抛出当前设备 ID，便于页面做跳转
    const handleClick = () => {
      emit('select', props.device.deviceId);
    };

    return () => (
      <NCard class="device-card" hoverable style={{ cursor: 'pointer' }}>
        <div class="card-content" onClick={handleClick}>
          <div class="device-info">
            <h3>{props.device.name}</h3>
            <p>设备ID: {props.device.deviceId}</p>
          </div>
          <div class="device-status">
            <NTag type={props.device.status === 'online' ? 'success' : 'default'}>
              {props.device.status === 'online' ? '在线' : '离线'}
            </NTag>
          </div>
        </div>
      </NCard>
    );
  },
});
