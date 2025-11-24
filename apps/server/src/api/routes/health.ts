import Router from "@koa/router";

const router = new Router();

/**
 * 健康检查端点，便于 K8s / Docker Compose 做存活检测
 */
router.get("/health", async (ctx) => {
  ctx.body = { status: "ok", timestamp: new Date().toISOString() };
});

export default router;

