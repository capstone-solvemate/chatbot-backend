import type { IncomingMessage } from "node:http";
import type { WebSocket } from "ws";

import type { WsContext } from "~/core/api/ws/types/WsContext";

import { WsHandler } from "~/core/api/ws/types/WsHandler";

import type { ManajerWsChat } from "./ManajerWsChat.js";

export class WsHandlerListenChatBaru extends WsHandler {
  constructor(private manajerWsChat: ManajerWsChat) {
    super();
  }

  async handle(ws: WebSocket, req: IncomingMessage, context: WsContext): Promise<void> {
    await this.manajerWsChat.listenChatBaru(ws, context);
  }
}
