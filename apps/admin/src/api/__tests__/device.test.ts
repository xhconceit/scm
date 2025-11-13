import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { deviceApi } from '../device';

vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
  // axios.create() 返回 axios 实例本身，便于统一断言
  mockAxios.create.mockReturnValue(mockAxios);
  return mockAxios;
});

const mockedAxios = axios as unknown as {
  create: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

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
