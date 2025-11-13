import Router from '@koa/router';
import { DeviceController } from '../controllers/deviceController';

const router = new Router();

// 设备路由
router.get('/devices', DeviceController.getAllDevices);
router.get('/devices/:id', DeviceController.getDeviceById);
router.post('/devices', DeviceController.createDevice);
router.put('/devices/:id', DeviceController.updateDevice);
router.delete('/devices/:id', DeviceController.deleteDevice);

// 设备数据路由
router.get('/devices/:id/realtime', DeviceController.getRealtimeData);
router.get('/devices/:id/history', DeviceController.getHistoryData);

export default router;
