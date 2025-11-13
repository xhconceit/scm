# SCM - 数据采集系统

甘蔗收割机数据采集与监控项目（Monorepo）

## 项目简介

SCM (Sugarcane Collection & Monitoring) 是一个用于收集和监控甘蔗收割机实时运行数据的系统。该系统通过标准化的数据格式采集设备运行状态，为设备维护和性能分析提供数据支持。

项目采用 **pnpm Monorepo** 架构，包含以下两个子项目：

- **server**: 后端服务，负责 MQTT 数据采集、处理和存储
- **admin**: 后台管理前端，提供数据可视化和设备管理界面

## 数据格式说明

### MQTT 主题格式

```text
sugarcane harvester/1001/realtime
```

### 消息数据格式

```json
{
  "type": 1,
  "module": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}
```

#### 字段说明

- **type**: 数据类型标识

  - `1`: 类型一数据（18 个模块数据）
  - `2`: 类型二数据（18 个模块数据）

- **module**: 模块数据数组
  - 长度: 18 个元素
  - 数据类型: 整型数值
  - 含义: 各个模块的实时状态值

### 数据示例

```text
主题: sugarcane harvester/1001/realtime
消息: {"type": 1, "module": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}
```

```text
主题: sugarcane harvester/1001/realtime
消息: {"type": 2, "module": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}
```

## 类型定义

```typescript
// 消息数据类型
interface RealtimeMessage {
  type: 1 | 2;
  module: number[]; // 长度为 18
}

// 设备配置
interface DeviceConfig {
  id: number;
  name: string;
}

// MQTT 配置
interface MqttConfig {
  broker: string;
  port: number;
  username?: string;
  password?: string;
}
```

## 快速开始

### 🐳 Docker 快速部署（推荐）

**一键启动所有服务：**

```bash
# 使用 Makefile（最简单）
make prod-up

# 查看服务状态
make ps

# 访问应用
# Admin 前端: http://localhost:8080
# Server API: http://localhost:3000
# MQTT Broker: mqtt://localhost:1883 (内置 Aedes)
```

详细的 Docker 部署指南请查看 [DOCKER.md](DOCKER.md)

### 💻 本地开发

#### 环境要求

**使用 Docker（推荐）：**

- Docker 20.10+
- Docker Compose 2.0+
- Make（可选）

**本地开发：**

- Node.js 18+
- pnpm 8+
- TypeScript 5.0+
- PostgreSQL 15+
- 无需额外安装 MQTT Broker（使用内置的 Aedes）

### 安装 pnpm

如果还没有安装 pnpm：

```bash
npm install -g pnpm
```

### 克隆项目

```bash
git clone <repository-url>
cd scm
```

### 安装依赖

在项目根目录执行：

```bash
pnpm install
```

这将安装所有子项目的依赖（包括 TSX 支持所需的 `@vitejs/plugin-vue-jsx`）。

如果需要单独为 Admin 项目添加 TSX 支持：

```bash
cd apps/admin
pnpm add -D @vitejs/plugin-vue-jsx
```

### 配置说明

#### Server 配置

在 `apps/server` 目录下创建 `.env` 文件：

```env
# 服务端口
PORT=3000
HTTP_PORT=3000

# MQTT Broker 配置（内置 Aedes）
MQTT_PORT=1883
MQTT_WS_PORT=8883

# MQTT 客户端配置（用于订阅其他 Broker）
MQTT_BROKER=mqtt://localhost
MQTT_CLIENT_PORT=1883
MQTT_USERNAME=
MQTT_PASSWORD=

# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/scm
```

#### Admin 配置

在 `apps/admin` 目录下创建 `.env` 文件：

```env
# API 地址
VITE_API_URL=http://localhost:3000
```

### 开发模式

#### 同时启动所有项目

```bash
pnpm dev
```

#### 单独启动 Server

```bash
pnpm --filter server dev
```

#### 单独启动 Admin

```bash
pnpm --filter admin dev
```

### 编译项目

#### 编译所有项目

```bash
pnpm build
```

#### 编译指定项目

```bash
pnpm --filter server build
pnpm --filter admin build
```

### 生产环境运行

```bash
# 启动 Server
pnpm --filter server start

# 预览 Admin（生产构建）
pnpm --filter admin preview
```

### Monorepo Scripts

根目录 `package.json` 的 scripts：

```json
{
  "scripts": {
    "dev": "pnpm --parallel --filter './apps/*' dev",
    "build": "pnpm --filter './apps/*' build",
    "test": "pnpm --filter './apps/*' test",
    "lint": "pnpm --filter './apps/*' lint",
    "clean": "pnpm --filter './apps/*' clean && rm -rf node_modules"
  }
}
```

## 项目结构

```text
scm/
├── README.md                    # 项目说明文档
├── DOCKER.md                    # Docker 部署指南
├── package.json                 # Monorepo 根配置
├── pnpm-workspace.yaml          # pnpm 工作空间配置
├── pnpm-lock.yaml              # 依赖锁定文件
├── .gitignore                  # Git 忽略文件
├── .gitattributes              # Git 属性配置
├── .editorconfig               # 编辑器配置
├── .npmrc                      # NPM/pnpm 配置
├── .dockerignore               # Docker 忽略文件
├── Makefile                    # Make 命令配置
├── tsconfig.json                # 共享 TypeScript 配置
│
├── docker/                     # Docker 配置目录
│   ├── docker-compose.yml      # 生产环境配置
│   ├── docker-compose.dev.yml  # 开发环境配置
│   ├── server/
│   │   └── Dockerfile          # Server Docker 配置
│   └── admin/
│       ├── Dockerfile          # Admin Docker 配置
│       └── nginx.conf          # Nginx 配置
│
├── scripts/                    # 便捷脚本
│   ├── docker-dev.sh           # 开发环境启动脚本
│   ├── docker-prod.sh          # 生产环境部署脚本
│   ├── docker-stop.sh          # 停止服务脚本
│   └── docker-logs.sh          # 日志查看脚本
│
├── apps/
│   ├── server/                  # 后端服务
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   ├── src/
│   │   │   ├── index.ts        # 服务入口
│   │   │   ├── types/
│   │   │   │   └── index.ts    # 类型定义
│   │   │   ├── services/
│   │   │   │   ├── mqtt-collector.ts    # MQTT 数据采集
│   │   │   │   ├── data-parser.ts       # 数据解析
│   │   │   │   └── storage.ts           # 数据存储
│   │   │   ├── api/
│   │   │   │   ├── routes/              # API 路由
│   │   │   │   └── controllers/         # 控制器
│   │   │   ├── database/
│   │   │   │   ├── models/              # 数据模型
│   │   │   │   └── migrations/          # 数据库迁移
│   │   │   ├── config/
│   │   │   │   └── config.ts            # 配置管理
│   │   │   └── utils/
│   │   │       ├── logger.ts            # 日志工具
│   │   │       └── validator.ts         # 数据验证
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Prisma 数据库模型
│   │   ├── dist/                        # 编译输出
│   │   ├── tests/                       # E2E 测试
│   │   └── jest.config.js               # Jest 配置
│   │
│   └── admin/                   # 后台管理前端
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       ├── .env.example
│       ├── src/
│       │   ├── main.ts                  # 应用入口
│       │   ├── App.vue
│       │   ├── pages/                   # 页面组件
│       │   │   ├── Dashboard.vue        # 仪表盘
│       │   │   ├── Devices.vue          # 设备管理
│       │   │   ├── RealTimeData.vue     # 实时数据
│       │   │   └── Settings.vue         # 系统设置
│       │   ├── components/              # 公共组件
│       │   │   ├── DataChart.vue        # 数据图表
│       │   │   ├── DeviceCard.vue       # 设备卡片
│       │   │   └── ModuleStatus.vue     # 模块状态
│       │   ├── api/                     # API 请求
│       │   ├── stores/                  # 状态管理
│       │   ├── router/                  # 路由配置
│       │   ├── types/                   # 类型定义
│       │   ├── utils/                   # 工具函数
│       │   └── assets/                  # 静态资源
│       ├── dist/                        # 构建输出
│       └── vitest.config.ts             # Vitest 配置
│
└── packages/                    # 共享代码包（可选）
    └── shared/                  # 共享类型定义和工具
        └── types/
            └── index.ts
```

## 功能特性

### Server（后端）

- ✅ MQTT 实时数据采集
- ✅ 标准化数据格式
- ✅ TypeScript 类型安全
- ✅ 多设备支持
- ✅ RESTful API
- ✅ 数据持久化存储
- ✅ 异步处理机制
- ✅ 单元测试和集成测试
- ⏳ WebSocket 实时推送（开发中）
- ⏳ 异常告警系统（计划中）

### Admin（前端）

- ✅ 响应式仪表盘
- ✅ 实时数据可视化
- ✅ 设备管理界面
- ✅ 现代化 UI/UX
- ✅ 组件单元测试
- ⏳ 数据导出功能（开发中）
- ⏳ 用户权限管理（计划中）

## 技术栈

### Server（后端）

- **Node.js**: JavaScript 运行时环境
- **TypeScript**: 类型安全的 JavaScript 超集
- **Koa**: 轻量级 Web 应用框架
- **Aedes**: 内置 MQTT Broker
- **MQTT.js**: MQTT 客户端库
- **Prisma**: 现代化 ORM
- **PostgreSQL**: 关系型数据库
- **Jest**: 测试框架

### Admin（前端）

- **Vue 3**: 渐进式前端框架（支持 TSX）
- **TypeScript**: 类型安全
- **TSX/JSX**: 支持 TypeScript + JSX 语法
- **Vite**: 下一代前端构建工具
- **Pinia**: Vue 状态管理
- **Vue Router**: 路由管理
- **Element Plus**: UI 组件库
- **ECharts**: 数据可视化图表库
- **TailwindCSS**: 实用优先的 CSS 框架
- **Vitest**: 测试框架（基于 Vite）

## 工作空间配置

### pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

## 主要依赖

### Server 依赖

```json
{
  "name": "@scm/server",
  "dependencies": {
    "koa": "^2.14.2",
    "@koa/router": "^12.0.1",
    "@koa/cors": "^4.0.0",
    "koa-bodyparser": "^4.4.1",
    "aedes": "^0.51.0",
    "mqtt": "^5.3.0",
    "@prisma/client": "^5.7.0",
    "dotenv": "^16.3.1",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/koa": "^2.13.12",
    "@types/koa__router": "^12.0.4",
    "@types/koa__cors": "^4.0.0",
    "@types/koa-bodyparser": "^4.3.12",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "ts-node-dev": "^2.0.0",
    "prisma": "^5.7.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "@types/jest": "^29.5.8",
    "supertest": "^6.3.3",
    "@types/supertest": "^6.0.2"
  }
}
```

### Admin 依赖

```json
{
  "name": "@scm/admin",
  "dependencies": {
    "vue": "^3.3.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "element-plus": "^2.4.0",
    "echarts": "^5.4.0",
    "axios": "^1.5.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.4.0",
    "@vitejs/plugin-vue-jsx": "^3.1.0",
    "vite": "^5.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "vitest": "^1.0.0",
    "@vue/test-utils": "^2.4.0",
    "jsdom": "^23.0.0",
    "@vitest/ui": "^1.0.0"
  }
}
```

## 使用示例

### Server - MQTT 数据采集

```typescript
// apps/server/src/services/mqtt-collector.ts
import mqtt from "mqtt";
import { RealtimeMessage } from "../types";
import { DataParser } from "./data-parser";

export class MqttCollector {
  private client: mqtt.MqttClient;

  constructor(private config: MqttConfig) {
    this.client = mqtt.connect(config.broker, {
      port: config.port,
      username: config.username,
      password: config.password,
    });
  }

  subscribe(topic: string) {
    this.client.subscribe(topic, (err) => {
      if (!err) {
        console.log(`已订阅主题: ${topic}`);
      }
    });

    this.client.on("message", (topic, payload) => {
      const data = DataParser.parse(payload.toString());
      this.handleRealtimeData(data);
    });
  }

  private handleRealtimeData(message: RealtimeMessage) {
    // 保存到数据库
    // 触发 WebSocket 推送
    console.log("接收数据:", message);
  }
}
```

### Server - API 路由

```typescript
// apps/server/src/api/routes/devices.ts
import Router from "@koa/router";
import { Context } from "koa";

const router = new Router();

// 获取所有设备
router.get("/devices", async (ctx: Context) => {
  ctx.body = {
    success: true,
    data: [
      /* 设备列表 */
    ],
  };
});

// 获取设备实时数据
router.get("/devices/:id/realtime", async (ctx: Context) => {
  const { id } = ctx.params;
  ctx.body = {
    success: true,
    data: {
      /* 实时数据 */
    },
  };
});

// 获取设备历史数据
router.get("/devices/:id/history", async (ctx: Context) => {
  const { id } = ctx.params;
  ctx.body = {
    success: true,
    data: {
      /* 历史数据 */
    },
  };
});

export default router;
```

### Admin - API 调用

```typescript
// apps/admin/src/api/device.ts
import axios from "axios";
import { RealtimeMessage } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const deviceApi = {
  // 获取所有设备
  getDevices: () => api.get("/api/devices"),

  // 获取设备实时数据
  getRealtimeData: (deviceId: number) =>
    api.get<RealtimeMessage>(`/api/devices/${deviceId}/realtime`),

  // 获取设备历史数据
  getHistoryData: (deviceId: number, params: any) =>
    api.get(`/api/devices/${deviceId}/history`, { params }),
};
```

### Admin - 组件使用（SFC 方式）

```vue
<!-- apps/admin/src/pages/RealTimeData.vue -->
<template>
  <div class="realtime-data">
    <el-card>
      <h2>实时数据监控</h2>
      <div v-if="realtimeData">
        <p>数据类型: {{ realtimeData.type }}</p>
        <ModuleStatus :modules="realtimeData.module" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { deviceApi } from "../api/device";
import ModuleStatus from "../components/ModuleStatus.vue";

const realtimeData = ref(null);

onMounted(async () => {
  const { data } = await deviceApi.getRealtimeData(1001);
  realtimeData.value = data;
});
</script>
```

### Admin - 组件使用（TSX 方式）

```tsx
// apps/admin/src/pages/RealTimeData.tsx
import { defineComponent, ref, onMounted } from "vue";
import { ElCard } from "element-plus";
import { deviceApi } from "../api/device";
import ModuleStatus from "../components/ModuleStatus";
import type { RealtimeMessage } from "../types";

export default defineComponent({
  name: "RealTimeData",
  setup() {
    const realtimeData = ref<RealtimeMessage | null>(null);

    onMounted(async () => {
      const { data } = await deviceApi.getRealtimeData(1001);
      realtimeData.value = data;
    });

    return () => (
      <div class="realtime-data">
        <ElCard>
          <h2>实时数据监控</h2>
          {realtimeData.value && (
            <div>
              <p>数据类型: {realtimeData.value.type}</p>
              <ModuleStatus modules={realtimeData.value.module} />
            </div>
          )}
        </ElCard>
      </div>
    );
  },
});
```

### Admin - 函数式组件（TSX）

```tsx
// apps/admin/src/components/DeviceCard.tsx
import { defineComponent } from "vue";
import { ElCard, ElTag } from "element-plus";
import type { PropType } from "vue";

interface Device {
  id: number;
  name: string;
  status: "online" | "offline";
}

export default defineComponent({
  name: "DeviceCard",
  props: {
    device: {
      type: Object as PropType<Device>,
      required: true,
    },
  },
  emits: ["select"],
  setup(props, { emit }) {
    const handleClick = () => {
      emit("select", props.device.id);
    };

    const statusColor = () => {
      return props.device.status === "online" ? "success" : "danger";
    };

    return () => (
      <ElCard class="device-card" onClick={handleClick}>
        <div class="device-info">
          <h3>{props.device.name}</h3>
          <ElTag type={statusColor()}>
            {props.device.status === "online" ? "在线" : "离线"}
          </ElTag>
        </div>
      </ElCard>
    );
  },
});
```

### Server - 单元测试示例

```typescript
// apps/server/src/api/routes/__tests__/devices.test.ts
import request from "supertest";
import Koa from "koa";
import Router from "@koa/router";
import deviceRoutes from "../devices";

describe("Device API", () => {
  let app: Koa;

  beforeAll(() => {
    app = new Koa();
    const router = new Router();
    router.use("/api", deviceRoutes.routes());
    app.use(router.routes());
  });

  describe("GET /api/devices", () => {
    it("should return all devices", async () => {
      const response = await request(app.callback())
        .get("/api/devices")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("GET /api/devices/:id", () => {
    it("should return device by id", async () => {
      const response = await request(app.callback())
        .get("/api/devices/1001")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1001);
    });
  });
});
```

### Server - MQTT 服务测试

```typescript
// apps/server/src/services/__tests__/mqtt-collector.test.ts
import { MqttCollector } from "../mqtt-collector";

describe("MqttCollector", () => {
  let collector: MqttCollector;

  beforeEach(() => {
    collector = new MqttCollector({
      broker: "mqtt://localhost",
      port: 1883,
    });
  });

  afterEach(() => {
    collector.disconnect();
  });

  it("should connect to MQTT broker", async () => {
    await expect(collector.connect()).resolves.not.toThrow();
  });

  it("should subscribe to topic", async () => {
    await collector.connect();
    await expect(collector.subscribe("test/topic")).resolves.not.toThrow();
  });

  it("should parse incoming message", () => {
    const payload = JSON.stringify({
      type: 1,
      module: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    });

    const result = collector.parseMessage(payload);
    expect(result.type).toBe(1);
    expect(result.module).toHaveLength(18);
  });
});
```

### Admin - 组件测试示例

```typescript
// apps/admin/src/components/__tests__/DeviceCard.test.ts
import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import DeviceCard from "../DeviceCard.vue";

describe("DeviceCard", () => {
  it("renders device information", () => {
    const wrapper = mount(DeviceCard, {
      props: {
        device: {
          id: 1001,
          name: "甘蔗收割机 #1001",
          status: "online",
        },
      },
    });

    expect(wrapper.text()).toContain("甘蔗收割机 #1001");
    expect(wrapper.find(".status").text()).toBe("online");
  });

  it("emits event when clicked", async () => {
    const wrapper = mount(DeviceCard, {
      props: {
        device: { id: 1001, name: "Test", status: "online" },
      },
    });

    await wrapper.trigger("click");
    expect(wrapper.emitted()).toHaveProperty("select");
    expect(wrapper.emitted("select")?.[0]).toEqual([1001]);
  });
});
```

### Admin - API 测试示例

```typescript
// apps/admin/src/api/__tests__/device.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { deviceApi } from "../device";

vi.mock("axios");

describe("Device API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch all devices", async () => {
    const mockData = { success: true, data: [] };
    vi.mocked(axios.get).mockResolvedValue({ data: mockData });

    const result = await deviceApi.getDevices();

    expect(axios.get).toHaveBeenCalledWith("/api/devices");
    expect(result.data).toEqual(mockData);
  });

  it("should fetch realtime data", async () => {
    const mockData = {
      success: true,
      data: { type: 1, module: [] },
    };
    vi.mocked(axios.get).mockResolvedValue({ data: mockData });

    const result = await deviceApi.getRealtimeData(1001);

    expect(axios.get).toHaveBeenCalledWith("/api/devices/1001/realtime");
    expect(result.data).toEqual(mockData);
  });
});
```

### Admin - TSX 组件测试示例

```typescript
// apps/admin/src/components/__tests__/Counter.test.tsx
import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import Counter from "../Counter";

describe("Counter (TSX)", () => {
  it("renders initial count", () => {
    const wrapper = mount(Counter);
    expect(wrapper.text()).toContain("计数: 0");
  });

  it("increments count when button clicked", async () => {
    const wrapper = mount(Counter);
    const button = wrapper.find("button");

    await button.trigger("click");
    expect(wrapper.text()).toContain("计数: 1");

    await button.trigger("click");
    expect(wrapper.text()).toContain("计数: 2");
  });

  it("emits change event with new value", async () => {
    const wrapper = mount(Counter);
    await wrapper.find("button").trigger("click");

    expect(wrapper.emitted()).toHaveProperty("change");
    expect(wrapper.emitted("change")?.[0]).toEqual([1]);
  });
});
```

## Vue TSX 开发指南

项目已配置支持 **TSX (TypeScript + JSX)** 语法，您可以同时使用 `.vue` 和 `.tsx` 文件编写组件。

### TSX 配置说明

#### Vite 配置

```typescript
// apps/admin/vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

export default defineConfig({
  plugins: [
    vue(), // 支持 .vue 文件
    vueJsx(), // 支持 .tsx/.jsx 文件
  ],
});
```

#### TypeScript 配置

```json
// apps/admin/tsconfig.json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "vue"
  }
}
```

### TSX 组件编写方式

#### 1. 基础组件（defineComponent）

```tsx
import { defineComponent } from "vue";

export default defineComponent({
  name: "MyComponent",
  setup() {
    return () => (
      <div class="my-component">
        <h1>Hello TSX!</h1>
      </div>
    );
  },
});
```

#### 2. 带 Props 的组件

```tsx
import { defineComponent, type PropType } from "vue";

interface User {
  name: string;
  age: number;
}

export default defineComponent({
  name: "UserCard",
  props: {
    user: {
      type: Object as PropType<User>,
      required: true,
    },
    showAge: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    return () => (
      <div class="user-card">
        <h3>{props.user.name}</h3>
        {props.showAge && <p>年龄: {props.user.age}</p>}
      </div>
    );
  },
});
```

#### 3. 带状态和事件的组件

```tsx
import { defineComponent, ref } from "vue";
import { ElButton } from "element-plus";

export default defineComponent({
  name: "Counter",
  emits: ["change"],
  setup(_, { emit }) {
    const count = ref(0);

    const increment = () => {
      count.value++;
      emit("change", count.value);
    };

    return () => (
      <div class="counter">
        <p>计数: {count.value}</p>
        <ElButton onClick={increment}>增加</ElButton>
      </div>
    );
  },
});
```

#### 4. 使用组合式 API

```tsx
import { defineComponent, ref, computed, onMounted } from "vue";

export default defineComponent({
  name: "DataList",
  setup() {
    const items = ref<string[]>([]);
    const loading = ref(false);

    const itemCount = computed(() => items.value.length);

    const fetchData = async () => {
      loading.value = true;
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      items.value = ["Item 1", "Item 2", "Item 3"];
      loading.value = false;
    };

    onMounted(() => {
      fetchData();
    });

    return () => (
      <div class="data-list">
        {loading.value ? (
          <p>加载中...</p>
        ) : (
          <div>
            <p>共 {itemCount.value} 项</p>
            <ul>
              {items.value.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
});
```

#### 5. 条件渲染与列表渲染

```tsx
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "TodoList",
  setup() {
    const todos = ref([
      { id: 1, text: "学习 Vue", done: true },
      { id: 2, text: "学习 TSX", done: false },
      { id: 3, text: "构建项目", done: false },
    ]);

    const filter = ref<"all" | "active" | "completed">("all");

    const filteredTodos = computed(() => {
      if (filter.value === "active") {
        return todos.value.filter((t) => !t.done);
      }
      if (filter.value === "completed") {
        return todos.value.filter((t) => t.done);
      }
      return todos.value;
    });

    return () => (
      <div class="todo-list">
        <div class="filters">
          <button onClick={() => (filter.value = "all")}>全部</button>
          <button onClick={() => (filter.value = "active")}>未完成</button>
          <button onClick={() => (filter.value = "completed")}>已完成</button>
        </div>

        <ul>
          {filteredTodos.value.map((todo) => (
            <li key={todo.id} class={{ done: todo.done }}>
              {todo.text}
            </li>
          ))}
        </ul>
      </div>
    );
  },
});
```

#### 6. 插槽使用

```tsx
import { defineComponent } from "vue";

export default defineComponent({
  name: "Card",
  setup(_, { slots }) {
    return () => (
      <div class="card">
        <div class="card-header">{slots.header?.()}</div>
        <div class="card-body">{slots.default?.()}</div>
        <div class="card-footer">{slots.footer?.()}</div>
      </div>
    );
  },
});

// 使用方式
<Card>
  {{
    header: () => <h2>标题</h2>,
    default: () => <p>内容</p>,
    footer: () => <button>确定</button>,
  }}
</Card>;
```

#### 7. 与 Element Plus 集成

```tsx
import { defineComponent, ref } from "vue";
import {
  ElCard,
  ElTable,
  ElTableColumn,
  ElButton,
  ElMessage,
} from "element-plus";

interface TableData {
  id: number;
  name: string;
  status: string;
}

export default defineComponent({
  name: "DeviceTable",
  setup() {
    const tableData = ref<TableData[]>([
      { id: 1, name: "设备1", status: "online" },
      { id: 2, name: "设备2", status: "offline" },
    ]);

    const handleView = (row: TableData) => {
      ElMessage.success(`查看设备: ${row.name}`);
    };

    return () => (
      <ElCard>
        <ElTable data={tableData.value}>
          <ElTableColumn prop="id" label="ID" width="80" />
          <ElTableColumn prop="name" label="设备名称" />
          <ElTableColumn prop="status" label="状态" />
          <ElTableColumn label="操作">
            {{
              default: ({ row }: { row: TableData }) => (
                <ElButton
                  type="primary"
                  size="small"
                  onClick={() => handleView(row)}
                >
                  查看
                </ElButton>
              ),
            }}
          </ElTableColumn>
        </ElTable>
      </ElCard>
    );
  },
});
```

### TSX vs SFC 对比

| 特性         | TSX                           | SFC (.vue)           |
| ------------ | ----------------------------- | -------------------- |
| **类型安全** | ✅ 完全的 TypeScript 类型推断 | ⚠️ 需要额外配置      |
| **IDE 支持** | ✅ 原生 TypeScript 支持       | ✅ 需要 Volar 插件   |
| **模板语法** | ❌ 使用 JSX 语法              | ✅ 使用 Vue 模板语法 |
| **样式隔离** | ❌ 需要 CSS-in-JS 或外部样式  | ✅ 内置 scoped 样式  |
| **学习曲线** | React 开发者友好              | Vue 开发者友好       |
| **代码组织** | ✅ 逻辑和视图在一起           | ⚠️ 模板和逻辑分离    |

### 使用建议

1. **复杂业务逻辑组件**: 推荐使用 TSX，更好的类型推断
2. **展示型组件**: 可以使用 SFC，模板更直观
3. **需要大量条件渲染**: TSX 更灵活
4. **需要样式隔离**: SFC 更方便

### 注意事项

1. **属性绑定**:

   - TSX: `<div class="foo">`
   - SFC: `<div class="foo">`

2. **事件绑定**:

   - TSX: `<button onClick={handler}>`
   - SFC: `<button @click="handler">`

3. **v-model**:

   ```tsx
   // TSX 需要手动实现
   <input
     value={value.value}
     onInput={(e) => value.value = e.target.value}
   />

   // 或使用 v-model（需要额外配置）
   <input v-model={value.value} />
   ```

4. **动态类名**:

   ```tsx
   // 对象方式
   <div class={{ active: isActive.value, disabled: isDisabled.value }} />

   // 数组方式
   <div class={['base-class', isActive.value && 'active']} />
   ```

## 开发指南

### 初始化新项目

1. **克隆并安装依赖**

```bash
git clone <repository-url>
cd scm
pnpm install
```

2. **配置环境变量**

```bash
# Server
cp apps/server/.env.example apps/server/.env
# 编辑 apps/server/.env 填入配置

# Admin
cp apps/admin/.env.example apps/admin/.env
# 编辑 apps/admin/.env 填入 API 地址
```

3. **初始化数据库**

```bash
cd apps/server
pnpm prisma migrate dev
pnpm prisma generate
```

### 添加新设备

1. 通过 Admin 界面添加设备
2. 或在数据库中直接添加设备记录
3. Server 会自动订阅新设备的 MQTT 主题

### 扩展数据类型

#### Server 端

1. 更新共享类型定义（如果使用 shared）

```typescript
// shared/types/index.ts
export interface RealtimeMessage {
  type: 1 | 2 | 3; // 添加新类型
  module: number[];
  timestamp?: number; // 添加新字段
}
```

2. 更新数据解析逻辑

```typescript
// apps/server/src/services/data-parser.ts
export class DataParser {
  static parse(payload: string): RealtimeMessage {
    const data = JSON.parse(payload);
    // 添加新类型的验证和处理逻辑
    return data;
  }
}
```

#### Admin 端

1. 同步类型定义（如果使用 shared）
2. 更新 UI 组件以支持新类型

### 添加新的 API 端点

```typescript
// apps/server/src/api/routes/devices.ts
router.post("/devices/:id/control", async (ctx: Context) => {
  const { id } = ctx.params;
  const { action } = ctx.request.body;

  ctx.body = {
    success: true,
    message: "Control command sent",
  };
});
```

### 添加新的前端页面

1. 创建页面组件

```bash
cd apps/admin/src/pages
touch NewPage.vue
```

2. 添加路由

```typescript
// apps/admin/src/router/index.ts
{
  path: '/new-page',
  name: 'NewPage',
  component: () => import('../pages/NewPage.vue')
}
```

### 运行测试

#### 所有项目

```bash
# 运行所有测试
pnpm test

# 运行测试并查看覆盖率
pnpm test:coverage

# 监听模式（开发时）
pnpm test:watch
```

#### 单个项目

```bash
# Server 测试
pnpm --filter server test              # 运行所有测试
pnpm --filter server test:watch        # 监听模式
pnpm --filter server test:coverage     # 覆盖率报告

# Admin 测试
pnpm --filter admin test               # 运行所有测试
pnpm --filter admin test:watch         # 监听模式
pnpm --filter admin test:ui            # UI 模式（Vitest）
pnpm --filter admin test:coverage      # 覆盖率报告
```

#### 运行特定测试

```bash
# Server - 运行特定文件
pnpm --filter server test device.test.ts

# Server - 运行匹配的测试
pnpm --filter server test -- -t "should get all devices"

# Admin - 运行特定组件测试
pnpm --filter admin test Dashboard.test.ts
```

### 代码检查

```bash
# 检查所有项目
pnpm lint

# 检查单个项目
pnpm --filter server lint
pnpm --filter admin lint
```

### 自动修复代码风格

```bash
pnpm --filter server lint:fix
pnpm --filter admin lint:fix
```

### 数据库操作

```bash
# 创建迁移
cd apps/server
pnpm prisma migrate dev --name <migration_name>

# 查看数据库
pnpm prisma studio

# 重置数据库
pnpm prisma migrate reset
```

### 部署

#### 使用 Docker（推荐）

##### 快速启动（使用 Makefile）

项目提供了便捷的 Makefile 命令：

```bash
# 查看所有可用命令
make help

# 开发环境：启动数据库和 MQTT，本地运行代码
make dev-up          # 启动基础服务
pnpm dev             # 本地运行应用
make dev-down        # 停止基础服务

# 生产环境：完整的 Docker 部署
make prod-up         # 构建并启动所有服务
make logs            # 查看日志
make ps              # 查看服务状态
make prod-down       # 停止所有服务

# 其他常用命令
make logs-server     # 查看 server 日志
make logs-admin      # 查看 admin 日志
make restart         # 重启服务
make clean           # 清理容器和数据卷
make db-migrate      # 执行数据库迁移
```

##### 生产环境部署（原生 Docker 命令）

```bash
# 1. 构建所有镜像
docker-compose -f docker/docker-compose.yml build

# 2. 启动所有服务（包括 PostgreSQL、MQTT、Server、Admin）
docker-compose -f docker/docker-compose.yml up -d

# 3. 查看服务状态
docker-compose -f docker/docker-compose.yml ps

# 4. 查看日志
docker-compose -f docker/docker-compose.yml logs -f

# 5. 停止所有服务
docker-compose -f docker/docker-compose.yml down

# 6. 停止并删除数据卷（谨慎使用）
docker-compose -f docker/docker-compose.yml down -v
```

##### 使用便捷脚本

项目在 `scripts/` 目录提供了便捷脚本：

```bash
# 开发环境
./scripts/docker-dev.sh      # 启动开发环境基础服务

# 生产环境
./scripts/docker-prod.sh     # 部署生产环境
./scripts/docker-stop.sh     # 停止服务
./scripts/docker-logs.sh     # 查看日志

# 查看特定服务日志
./scripts/docker-logs.sh server
./scripts/docker-logs.sh admin
```

##### 开发环境基础服务

如果只需要启动数据库和 MQTT 服务，本地运行代码：

```bash
# 启动开发环境基础服务
docker-compose -f docker/docker-compose.dev.yml up -d

# 停止开发环境服务
docker-compose -f docker/docker-compose.dev.yml down
```

##### 服务访问地址

- **Admin 前端**: http://localhost:8080
- **Server API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **MQTT Broker**: mqtt://localhost:1883 (内置 Aedes Broker)

##### Docker 镜像单独构建

```bash
# 构建 Server 镜像
docker build -t scm-server:latest -f docker/server/Dockerfile .

# 构建 Admin 镜像
docker build -t scm-admin:latest -f docker/admin/Dockerfile .
```

##### 常用 Docker 命令

```bash
# 查看容器日志
docker-compose -f docker/docker-compose.yml logs server
docker-compose -f docker/docker-compose.yml logs admin

# 进入容器
docker exec -it scm-server sh
docker exec -it scm-postgres psql -U scmuser -d scm

# 重启特定服务
docker-compose -f docker/docker-compose.yml restart server

# 查看资源使用情况
docker stats
```

#### 手动部署

如果不使用 Docker，可以手动部署：

```bash
# 1. 编译所有项目
pnpm build

# 2. 部署 Server
cd apps/server/dist
node index.js

# 3. 部署 Admin（静态文件）
cd apps/admin/dist
# 将文件部署到 Nginx 或其他静态服务器
```

## Docker 架构说明

### 容器组成

项目通过 Docker Compose 编排以下服务：

1. **postgres**: PostgreSQL 15 数据库

   - 持久化数据存储
   - 健康检查机制
   - 数据卷挂载

2. **mqtt**: Aedes MQTT Broker（可选独立部署）

   - 轻量级 MQTT 消息代理
   - 基于 Node.js
   - 可集成到应用或独立运行

3. **server**: Node.js 后端服务

   - 多阶段构建优化镜像大小
   - 自动运行数据库迁移
   - 健康检查端点

4. **admin**: Nginx + Vue 前端服务
   - 静态文件服务
   - API 反向代理
   - SPA 路由支持

### 多阶段构建

使用 Docker 多阶段构建减少镜像大小：

- **构建阶段**: 安装所有依赖并编译代码
- **生产阶段**: 只保留运行时依赖和编译产物

### 环境变量配置

生产环境的环境变量在 `docker-compose.yml` 中配置：

```yaml
environment:
  MQTT_BROKER: mqtt://mqtt
  DATABASE_URL: postgresql://scmuser:scmpassword@postgres:5432/scm
  PORT: 3000
```

如需修改，编辑 `docker-compose.yml` 文件。

### 数据持久化

使用 Docker 数据卷持久化存储：

- `postgres_data`: PostgreSQL 数据
- `emqx_data`: MQTT Broker 数据
- `emqx_log`: MQTT Broker 日志

### 网络通信

所有服务在 `scm-network` 网络中通信，服务间可通过容器名称互相访问。

## Monorepo 优势

- ✅ **代码共享**: 类型定义、工具函数等可以在应用之间共享
- ✅ **统一依赖管理**: 通过 pnpm workspace 统一管理所有依赖
- ✅ **原子化提交**: 前后端同时修改可以在一个 commit 中完成
- ✅ **统一构建流程**: 一键构建、测试、部署所有项目
- ✅ **开发体验**: 同时启动多个项目，便于全栈开发
- ✅ **Docker 集成**: 完整的容器化部署方案

## API 文档

Server 启动后，访问以下地址查看 API 文档：

```text
http://localhost:3000/api/docs
```

### 主要 API 端点

```text
GET    /api/devices              # 获取所有设备列表
GET    /api/devices/:id          # 获取设备详情
GET    /api/devices/:id/realtime # 获取设备实时数据
GET    /api/devices/:id/history  # 获取设备历史数据
POST   /api/devices              # 添加新设备
PUT    /api/devices/:id          # 更新设备信息
DELETE /api/devices/:id          # 删除设备
```

## 常见问题

### 1. pnpm 安装失败？

确保 Node.js 版本 >= 18：

```bash
node -v
```

如果版本过低，请升级 Node.js。

### 2. 如何在应用之间共享代码？

创建 `shared` package：

```bash
mkdir -p packages/shared/types
cd packages/shared
pnpm init
```

然后在应用（apps）中引用：

```json
{
  "dependencies": {
    "@scm/shared": "workspace:*"
  }
}
```

### 3. 如何单独运行某个 package？

```bash
pnpm --filter <package-name> <script>
```

例如：

```bash
pnpm --filter server dev
pnpm --filter admin build
```

### 4. 数据库迁移问题？

如果遇到迁移错误，可以重置数据库：

```bash
cd apps/server
pnpm prisma migrate reset
pnpm prisma migrate dev
```

### 5. Admin 无法连接到 Server？

检查：

1. Server 是否正在运行
2. Admin 的 `.env` 文件中 `VITE_API_URL` 是否正确
3. Server 的 CORS 配置是否允许 Admin 的域名

### 6. Docker 容器无法启动？

```bash
# 查看详细错误日志
docker-compose logs

# 清理并重新构建
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### 7. 如何在 Docker 中执行数据库迁移？

```bash
# 进入 server 容器
docker exec -it scm-server sh

# 执行迁移
pnpm prisma migrate deploy
```

### 8. Docker 容器中如何查看数据库？

```bash
# 方式1：通过 Prisma Studio
docker exec -it scm-server sh
pnpm prisma studio

# 方式2：直接连接 PostgreSQL
docker exec -it scm-postgres psql -U scmuser -d scm
```

### 9. MQTT 连接测试？

可以使用 MQTT 客户端工具进行测试：

```bash
# 使用 MQTT.js CLI 工具
npm install -g mqtt

# 订阅主题
mqtt sub -t 'sugarcane harvester/+/realtime' -h localhost -p 1883

# 发布消息
mqtt pub -t 'sugarcane harvester/1001/realtime' -h localhost -p 1883 \
  -m '{"type":1,"module":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}'
```

推荐使用的 MQTT 客户端工具：

- **MQTTX**: 跨平台 MQTT 桌面客户端
- **MQTT Explorer**: 功能丰富的图形化工具
- **mosquitto_pub/sub**: 命令行工具

## 贡献指南

欢迎提交 Issue 和 Pull Request！

### 提交规范

使用约定式提交（Conventional Commits）：

```text
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建/工具链更新
```

### 开发流程

1. Fork 项目
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'feat: add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系项目维护者或提交 Issue。

---

**Happy Coding! 🚀**
