import EventEmitter from "node:events";

import type { EventPesanTiketBaruPayload } from "./payload/EventPesanTiketBaruPayload.js";
import type { EventStatusTiketDiubahPayload } from "./payload/EventStatusTiketDiubahPayload.js";
import type { EventTiketDibuatPayload } from "./payload/EventTiketDibuatPayload.js";

export type TiketEventMap = {
  tiket_dibuat: [payload: EventTiketDibuatPayload];
  status_diubah: [payload: EventStatusTiketDiubahPayload];
  pesan_baru: [payload: EventPesanTiketBaruPayload];
};

export class TiketEventBus extends EventEmitter {
  emit<K extends keyof TiketEventMap>(event: K, ...args: TiketEventMap[K]): boolean {
    return super.emit(event, ...args);
  }

  on<K extends keyof TiketEventMap>(event: K, listener: (...args: TiketEventMap[K]) => void): this {
    return super.on(event, listener as (...args: any[]) => void);
  }

  off<K extends keyof TiketEventMap>(event: K, listener: (...args: TiketEventMap[K]) => void): this {
    return super.off(event, listener as (...args: any[]) => void);
  }
}
