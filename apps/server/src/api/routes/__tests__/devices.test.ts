import request from 'supertest';
import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import deviceRoutes from '../devices';

describe('Device API', () => {
  let app: Koa;

  beforeAll(() => {
    app = new Koa();
    app.use(cors());
    app.use(bodyParser());
    const router = new Router();
    router.use('/api', deviceRoutes.routes());
    app.use(router.routes());
  });

  describe('GET /api/devices', () => {
    it('should return all devices', async () => {
      const response = await request(app.callback())
        .get('/api/devices')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
