import { EventEmitter } from "node:events";

import type { EventChatDibuatPayload } from "./payload/EventChatDibuatPayload.js";
import type { EventPesanChatBaruPayload } from "./payload/EventPesanChatBaruPayload.js";

export type ChatEventMap = {
  chat_dibuat: [payload: EventChatDibuatPayload];
  pesan_baru: [payload: EventPesanChatBaruPayload];
};

export class ChatEventBus extends EventEmitter {
  emit<K extends keyof ChatEventMap>(event: K, ...args: ChatEventMap[K]): boolean {
    return super.emit(event, ...args);
  }

  on<K extends keyof ChatEventMap>(event: K, listener: (...args: ChatEventMap[K]) => void): this {
    return super.on(event, listener as (...args: any[]) => void);
  }

  off<K extends keyof ChatEventMap>(event: K, listener: (...args: ChatEventMap[K]) => void): this {
    return super.off(event, listener as (...args: any[]) => void);
  }
}
