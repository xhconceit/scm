/**
 * MQTT 实时消息结构
 * 对应 README 中的 RealtimeMessage 定义
 */
export interface RealtimeMessage {
  /**
   * 数据类型标识，目前只接受 1 或 2
   */
  type: 1 | 2;
  /**
   * 模块数据，固定 18 个整型数值
   */
  module: number[];
}

/**
 * 设备配置，表示设备在系统中的基础信息
 */
export interface DeviceConfig {
  /**
   * 自增主键（数据库内部使用）
   */
  id: number;
  /**
   * 设备显示名称，例如“甘蔗收割机 #1001”
   */
  name: string;
}

/**
 * MQTT 客户端/Broker 配置
 * - `port` 用于内置 Broker 的 TCP 端口
 * - `wsPort` 用于内置 Broker 的 WebSocket 端口
 * - `clientPort` 用于连接外部 Broker 时的客户端端口
 */
export interface MqttConfig {
  broker: string;
  port: number;
  wsPort?: number;
  clientPort?: number;
  username?: string;
  password?: string;
}

/**
 * API 标准响应格式
 */
export interface ApiResponse<T = any> {
  /**
   * 请求是否成功
   */
  success: boolean;
  /**
   * 成功时返回的数据
   */
  data?: T;
  /**
   * 额外的提示消息
   */
  message?: string;
  /**
   * 错误描述
   */
  error?: string;
}
