import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { deviceApi } from '../device';

vi.mock('axios');
const mockedAxios = axios as any;

describe('Device API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all devices', async () => {
    const mockData = { success: true, data: [] };
    mockedAxios.get.mockResolvedValue({ data: mockData });

    const result = await deviceApi.getDevices();

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/devices');
    expect(result.data).toEqual(mockData);
  });

  it('should fetch realtime data', async () => {
    const mockData = {
      success: true,
      data: { type: 1, module: [] },
    };
    mockedAxios.get.mockResolvedValue({ data: mockData });

    const result = await deviceApi.getRealtimeData(1001);

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/devices/1001/realtime');
    expect(result.data).toEqual(mockData);
  });
});
