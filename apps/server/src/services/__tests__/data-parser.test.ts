import { DataParser } from '../data-parser';
import { RealtimeMessage } from '../../types';

describe('DataParser', () => {
  describe('parse', () => {
    it('should parse valid message', () => {
      const payload = JSON.stringify({
        type: 1,
        module: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      });

      const result = DataParser.parse(payload);
      expect(result).not.toBeNull();
      expect(result?.type).toBe(1);
      expect(result?.module).toHaveLength(18);
    });

    it('should return null for invalid message', () => {
      const payload = 'invalid json';
      const result = DataParser.parse(payload);
      expect(result).toBeNull();
    });

    it('should return null for message with wrong type', () => {
      const payload = JSON.stringify({
        type: 3,
        module: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      });

      const result = DataParser.parse(payload);
      expect(result).toBeNull();
    });
  });

  describe('extractDeviceId', () => {
    it('should extract device ID from topic', () => {
      const topic = 'sugarcane harvester/1001/realtime';
      const deviceId = DataParser.extractDeviceId(topic);
      expect(deviceId).toBe(1001);
    });

    it('should return null for invalid topic', () => {
      const topic = 'invalid/topic';
      const deviceId = DataParser.extractDeviceId(topic);
      expect(deviceId).toBeNull();
    });
  });
});
