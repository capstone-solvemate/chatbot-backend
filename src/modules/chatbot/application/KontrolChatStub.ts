import * as uuid from "uuid";
import { vi } from "vitest";

import type { WsContext } from "~/core/api/ws/types/WsContext.js";

import type { KontrolChat } from "./KontrolChat.js";

export function mockKontrolChat(ovd: {
  listenPesanChatBaru?: (ws: WebSocket, wsContext: WsContext) => Promise<string>;
} = {}): KontrolChat {
  return {
    listenPesanChatBaru: ovd.listenPesanChatBaru ?? vi.fn().mockResolvedValue(uuid.v4().toString()),
  } as unknown as KontrolChat;
}
