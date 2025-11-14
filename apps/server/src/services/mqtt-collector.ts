import { createServer, Server as NetServer } from "net";
import Aedes, { Client } from "aedes";
import { DataParser } from "./data-parser";
import { MqttConfig } from "../types";
import { config } from "../config/config";
import logger from "../utils/logger";

interface MqttMessage {
  topic: string;
  payload: string;
  clientId: string;
}

/**
 * MQTT 数据采集器
 * - 启动内置 Aedes Broker（TCP + WebSocket）
 * - 可选连接外部 MQTT Broker 订阅数据
 * - 将消息解析并存储到数据库
 */
export class MqttCollector {
  // private readonly options: MqttCollectorOptions;
  private netServer: NetServer | null = null;
  private readonly broker: Aedes;
  private readonly options: MqttConfig;
  private readonly clients: Map<string, Client> = new Map();

  constructor(options: Partial<MqttConfig> = {}) {
    this.options = {
      broker: options.broker ?? config.mqtt.broker,
      port: options.port ?? config.mqtt.port,
      wsPort: options.wsPort ?? config.mqtt.wsPort,
      clientPort: options.clientPort ?? config.mqtt.clientPort,
      username: options.username ?? (config.mqtt.username || undefined),
      password: options.password ?? (config.mqtt.password || undefined),
    };
    this.broker = new Aedes({
      heartbeatInterval: 60000,
      connectTimeout: 30000,
    });
    this.setupBroker();
  }

  /**
   * 注册 Broker 的事件监听，便于排查连接、订阅、发布等行为
   */
  private setupBroker(): void {
    // 监听客户端连接
    this.broker.on("client", (client) => {
      if (client?.id) {
        this.clients.set(client.id, client);
      }
      logger.info("MQTT client connected", { id: client?.id });
    });
    // 监听客户端断开
    this.broker.on("clientDisconnect", (client) => {
      logger.info("MQTT client disconnected", { id: client?.id });
      if (client?.id) {
        this.clients.delete(client.id);
      }
    });
    // 监听发布消息
    this.broker.on("publish", (packet, client) => {
      // 无 client 是系统消息
      console.log(client?.id, "clientid");
      if (!client || !client.id) return;
      console.log(this.clients.has(client.id), "clients");
      if (!this.clients.has(client.id)) {
        logger.warn("Client not found", { clientId: client.id });
        return;
      }

      logger.warn("Message published", {
        topic: packet.topic,
        clientId: client.id,
      });
      logger.debug("Message payload", { payload: packet.payload.toString() });
    });
    // 监听订阅
    this.broker.on("subscribe", (subscriptions, client) => {
      logger.debug("Client subscribed", {
        subscriptions: subscriptions.map((s) => s.topic),
        clientId: client?.id,
      });
    });
    // this.broker
  }

  /**
   * 启动内置 MQTT Broker（TCP + WebSocket）
   */
  async startBroker(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // TCP 服务器，用于标准 MQTT 连接
        this.netServer = createServer((stream) => {
          this.broker.handle(stream);
        });
        this.netServer.listen(this.options.port, () => {
          logger.info(`MQTT Broker started on port ${this.options.port}`);
        });
        resolve();
      } catch (error) {
        logger.error("Failed to start MQTT broker", error);
        reject(error);
      }
    });
  }

  /**
   * 连接到外部 MQTT Broker（用于订阅其他来源的数据）
   */
  async connectToBroker(): Promise<void> {}

  /**
   * 订阅所有设备主题（sugarcane harvester/+/realtime）
   */
  private subscribeToAllDevices(): void {}

  /**
   * 订阅特定设备的实时数据
   */
  subscribeDevice(deviceId: number): void {}

  /**
   * 处理接收到的 MQTT 消息：解析 -> 校验 -> 持久化
   */
  private async handleMessage(topic: string, payload: Buffer): Promise<void> {}

  /**
   * 清理所有连接，释放资源
   */
  disconnect(): void {}
}
