import type { WsHandler } from "./WsHandler.js";
import type { WsRoute } from "./WsRoute.js";

export class WsRouter {
  private routes: WsRoute[] = [];

  route(path: string, ...targets: WsHandler[]): void {
    this.routes.push({
      path,
      targets,
    });
  }

  getRoutes(): WsRoute[] {
    return this.routes;
  }
}
