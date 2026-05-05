import type { IWsSessionHandler } from "./IWsSessionHandler.js";

export class WsSessionRegistry {
  static readonly instance = new WsSessionRegistry();
  private constructor() {}

  private readonly handlers = new Set<IWsSessionHandler>();

  daftarkan(handler: IWsSessionHandler): void {
    this.handlers.add(handler);
  }

  invalidasiSession(idSession: string): void {
    for (const handler of this.handlers) {
      handler.invalidasiSession(idSession);
    }
  }
}
