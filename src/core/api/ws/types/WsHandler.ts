import type { IncomingMessage } from "node:http";
import type { WebSocket } from "ws";

import type { WsContext } from "./WsContext.js";

export abstract class WsHandler {
  abstract handle(ws: WebSocket, req: IncomingMessage, context: WsContext): Promise<void>;
}
