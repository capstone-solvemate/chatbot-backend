import EventEmitter from "node:events";

import type { LogoutEventPayload } from "./LogoutEventPayload.js";

export class LogoutEventBus {
  private eventEmitter = new EventEmitter();
  private namaEvent = "otentikasi_logout";

  emit(data: LogoutEventPayload): boolean {
    return this.eventEmitter.emit(this.namaEvent, data);
  }

  on(listener: (data: LogoutEventPayload) => void): this {
    this.eventEmitter.on(this.namaEvent, listener);
    return this;
  }

  off(listener: (data: LogoutEventPayload) => void): this {
    this.eventEmitter.off(this.namaEvent, listener);
    return this;
  }
}
