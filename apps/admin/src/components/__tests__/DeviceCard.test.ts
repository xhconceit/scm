import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import DeviceCard from '../DeviceCard.vue';
import { Device } from '../../types';

describe('DeviceCard', () => {
  const mockDevice: Device = {
    id: 1,
    deviceId: 1001,
    name: '甘蔗收割机 #1001',
    status: 'online',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  it('renders device information', () => {
    const wrapper = mount(DeviceCard, {
      props: {
        device: mockDevice,
      },
    });

    expect(wrapper.text()).toContain('甘蔗收割机 #1001');
    expect(wrapper.text()).toContain('1001');
  });

  it('emits select event when clicked', async () => {
    const wrapper = mount(DeviceCard, {
      props: {
        device: mockDevice,
      },
    });

    await wrapper.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('select');
    expect(wrapper.emitted('select')?.[0]).toEqual([1001]);
  });
});
