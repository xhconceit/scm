import { createServer, Server as NetServer } from "net";
import Aedes, { Client } from "aedes";
import { EventEmitter } from "events";
import { MqttConfig } from "../types";
import { config } from "../config/config";
import logger from "../utils/logger";

export interface MqttMessage {
  topic: string;
  payload: string;
  clientId: string;
}

interface MqttCollectorEvents {
  message: [data: MqttMessage];
  error: [error: Error];
}

export class MqttCollector extends EventEmitter<MqttCollectorEvents> {
  private netServer: NetServer | null = null;
  private readonly broker: Aedes;
  private readonly options: MqttConfig;
  private readonly clients: Map<string, Client> = new Map();

  constructor(options: Partial<MqttConfig> = {}) {
    super();
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
      logger.info("MQTT 客户端连接", { id: client?.id });
    });
    // 监听客户端断开
    this.broker.on("clientDisconnect", (client) => {
      logger.info("MQTT 客户端断开", { id: client?.id });
      if (client?.id) {
        this.clients.delete(client.id);
      }
    });
    // 监听发布消息
    this.broker.on("publish", (packet, client) => {
      // 无 client 是系统消息
      if (!client || !client.id) return;
      logger.info("MQTT 客户端发布消息ID：", { id: client?.id });
      if (!this.clients.has(client.id)) {
        logger.warn("MQTT 客户端未找到", { clientId: client.id });
        return;
      }

      logger.info("MQTT 客户端发布消息，topic：", {
        topic: packet.topic,
        clientId: client.id,
      });

      this.emit("message", {
        topic: packet.topic,
        payload: packet.payload,
        clientId: client.id,
      } as MqttMessage);
    });
    // 监听订阅
    this.broker.on("subscribe", (subscriptions, client) => {
      logger.debug("MQTT 客户端订阅", {
        subscriptions: subscriptions.map((s) => s.topic),
        clientId: client?.id,
      });
    });
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
          logger.info(`MQTT Broker 启动成功，端口 ${this.options.port}`);
        });
        resolve();
      } catch (error) {
        logger.error("MQTT Broker 启动失败", error);
        reject(error);
      }
    });
  }

  getClients(): string[] {
    return Array.from(this.clients.keys());
  }

  /**
   * 关闭 Broker，释放资源
   */
  disconnect(): void {
    // 关闭所有客户端连接
    this.clients.forEach((client) => {
      client.close();
    });
    this.clients.clear();

    // 关闭服务器
    if (this.netServer) {
      this.netServer.close(() => {
        logger.info("MQTT Broker 关闭");
      });
      this.netServer = null;
    }

    // 关闭 Broker
    this.broker.close(() => {
      logger.info("Aedes Broker 关闭");
    });
  }
}
