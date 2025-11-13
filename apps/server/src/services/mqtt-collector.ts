import mqtt, { MqttClient } from 'mqtt';
import aedes from 'aedes';
import { createServer, Server as NetServer } from 'net';
import { Server as WebSocketServer } from 'ws';
import { createServer as createHttpServer } from 'http';
import { Duplex } from 'stream';
import { DataParser } from './data-parser';
import { Storage } from './storage';
import { MqttConfig } from '../types';
import { config } from '../config/config';
import logger from '../utils/logger';

export class MqttCollector {
  private broker: aedes.Aedes;
  private netServer: NetServer | null = null;
  private wsServer: WebSocketServer | null = null;
  private client: MqttClient | null = null;
  private subscribedDevices: Set<number> = new Set();

  constructor() {
    // 创建内置 MQTT Broker
    this.broker = aedes();
    this.setupBroker();
  }

  /**
   * 设置内置 MQTT Broker
   */
  private setupBroker(): void {
    // 监听客户端连接
    this.broker.on('client', (client) => {
      logger.info('MQTT client connected', { id: client.id });
    });

    // 监听客户端断开
    this.broker.on('clientDisconnect', (client) => {
      logger.info('MQTT client disconnected', { id: client.id });
    });

    // 监听发布消息
    this.broker.on('publish', (packet, client) => {
      if (client) {
        logger.debug('Message published', {
          topic: packet.topic,
          clientId: client.id,
        });
      }
    });

    // 监听订阅
    this.broker.on('subscribe', (subscriptions, client) => {
      logger.debug('Client subscribed', {
        subscriptions: subscriptions.map((s) => s.topic),
        clientId: client.id,
      });
    });
  }

  /**
   * 启动内置 MQTT Broker
   */
  async startBroker(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // TCP 服务器
        this.netServer = createServer((stream) => {
          this.broker.handle(stream);
        });
        this.netServer.listen(config.mqtt.port, () => {
          logger.info(`MQTT Broker started on port ${config.mqtt.port}`);
        });

        // WebSocket 服务器
        const httpServer = createHttpServer();
        this.wsServer = new WebSocketServer({ server: httpServer });
        this.wsServer.on('connection', (ws, req) => {
          const duplex = Duplex.fromWeb(ws as any);
          this.broker.handle(duplex);
        });
        httpServer.listen(config.mqtt.wsPort, () => {
          logger.info(`MQTT WebSocket server started on port ${config.mqtt.wsPort}`);
        });

        resolve();
      } catch (error) {
        logger.error('Failed to start MQTT broker', error);
        reject(error);
      }
    });
  }

  /**
   * 连接到外部 MQTT Broker（用于订阅数据）
   */
  async connectToBroker(): Promise<void> {
    if (this.client) {
      logger.warn('MQTT client already connected');
      return;
    }

    return new Promise((resolve, reject) => {
      const options: mqtt.IClientOptions = {
        port: config.mqtt.clientPort,
        reconnectPeriod: 5000,
      };

      if (config.mqtt.username) {
        options.username = config.mqtt.username;
      }
      if (config.mqtt.password) {
        options.password = config.mqtt.password;
      }

      this.client = mqtt.connect(config.mqtt.broker, options);

      this.client.on('connect', () => {
        logger.info('Connected to MQTT broker', { broker: config.mqtt.broker });
        this.subscribeToAllDevices();
        resolve();
      });

      this.client.on('error', (error) => {
        logger.error('MQTT client error', error);
        reject(error);
      });

      this.client.on('message', async (topic, payload) => {
        await this.handleMessage(topic, payload);
      });

      this.client.on('reconnect', () => {
        logger.info('Reconnecting to MQTT broker...');
      });

      this.client.on('close', () => {
        logger.warn('MQTT client disconnected');
      });
    });
  }

  /**
   * 订阅所有设备主题
   */
  private subscribeToAllDevices(): void {
    // 订阅所有设备的实时数据主题
    const topic = 'sugarcane harvester/+/realtime';
    this.client?.subscribe(topic, (err) => {
      if (err) {
        logger.error('Failed to subscribe to topic', { topic, error: err });
      } else {
        logger.info('Subscribed to topic', { topic });
      }
    });
  }

  /**
   * 订阅特定设备
   */
  subscribeDevice(deviceId: number): void {
    if (this.subscribedDevices.has(deviceId)) {
      return;
    }

    const topic = `sugarcane harvester/${deviceId}/realtime`;
    this.client?.subscribe(topic, (err) => {
      if (err) {
        logger.error('Failed to subscribe to device topic', { deviceId, topic, error: err });
      } else {
        logger.info('Subscribed to device topic', { deviceId, topic });
        this.subscribedDevices.add(deviceId);
      }
    });
  }

  /**
   * 处理接收到的消息
   */
  private async handleMessage(topic: string, payload: Buffer): Promise<void> {
    try {
      const deviceId = DataParser.extractDeviceId(topic);
      if (!deviceId) {
        logger.warn('Failed to extract device ID from topic', { topic });
        return;
      }

      const message = DataParser.parse(payload.toString());
      if (!message) {
        return;
      }

      // 保存到数据库
      await Storage.saveRealtimeData(deviceId, message);

      logger.debug('Message processed', { deviceId, type: message.type });
    } catch (error) {
      logger.error('Failed to handle message', { error, topic });
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.client) {
      this.client.end();
      this.client = null;
    }

    if (this.netServer) {
      this.netServer.close();
      this.netServer = null;
    }

    if (this.wsServer) {
      this.wsServer.close();
      this.wsServer = null;
    }

    logger.info('MQTT collector disconnected');
  }
}
