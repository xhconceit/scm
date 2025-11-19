import { createDiscreteApi } from "naive-ui";

// 创建 discrete API 实例，用于在组件外部使用 message、notification、dialog 等 API
const { message, notification, dialog, loadingBar } = createDiscreteApi([
  "message",
  "notification",
  "dialog",
  "loadingBar",
]);

export { message, notification, dialog, loadingBar };
