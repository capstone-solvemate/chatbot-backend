import type { WsHandler } from "./WsHandler.js";

export type WsRoute = {
  path: string;
  targets: (WsHandler)[];
};
