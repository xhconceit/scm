import Router from "@koa/router";
import healthRouter from "./health";
import configRouter from "./config";
import dataRouter from "./data";

/**
 * 统一注册所有路由
 */
export function registerRoutes(router: Router) {
  router.use(healthRouter.routes());
  router.use(configRouter.routes());
  router.use(dataRouter.routes());
}

