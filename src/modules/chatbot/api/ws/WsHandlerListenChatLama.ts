import type { IncomingMessage } from "node:http";
import type { WebSocket } from "ws";

import type { WsContext } from "~/core/api/ws/types/WsContext";

import { WsHandler } from "~/core/api/ws/types/WsHandler";
import { DataNotFoundError } from "~/core/types/DataNotFoundError.js";

import type { ManajerWsChat } from "./ManajerWsChat.js";

import { CHAT_ENTITY_NAME } from "../../domain/Chat.js";

export class WsHandlerListenChatLama extends WsHandler {
  constructor(private manajerWsChat: ManajerWsChat) {
    super();
  }

  async handle(ws: WebSocket, req: IncomingMessage, context: WsContext): Promise<void> {
    const urlWithoutQuery = (req.url ?? "").split("?")[0];
    const match = urlWithoutQuery.match(/\/chat\/(\d+)$/);

    const idChat = match ? BigInt(match[1]) : null;
    if (!idChat) {
      throw new DataNotFoundError(CHAT_ENTITY_NAME);
    }

    this.manajerWsChat.listenChatLama(ws, idChat, context);
  }
}
