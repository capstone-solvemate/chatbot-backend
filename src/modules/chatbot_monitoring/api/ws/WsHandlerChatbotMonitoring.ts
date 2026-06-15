import type { IncomingMessage } from "node:http";
import type { WebSocket } from "ws";

import type { WsContext } from "~/core/api/ws/types/WsContext";

import { WsHandler } from "~/core/api/ws/types/WsHandler";

import type { ChatbotMonitoringWsManager } from "./ChatbotMonitoringWsManager.js";
import type { FilterChatbotMonitoring } from "./payload/FilterChatbotMonitoring.js";

export class WsHandlerChatbotMonitoring extends WsHandler {
  constructor(
    private chatbotMonitoringWsManager: ChatbotMonitoringWsManager,
  ) {
    super();
  }

  private parseFilter(url: string): FilterChatbotMonitoring {
    const searchParams = new URL(url, "http://localhost").searchParams;

    const tahunRaw = searchParams.get("tahun");
    const tahun = tahunRaw ? Number.parseInt(tahunRaw, 10) : new Date().getFullYear();

    if (!Number.isFinite(tahun) || tahun < 2000) {
      return { tahun: new Date().getFullYear() };
    }

    const bulanRaw = searchParams.get("bulan");
    const bulan = bulanRaw ? Number.parseInt(bulanRaw, 10) : undefined;

    if (bulan === undefined || bulan < 1 || bulan > 12) {
      return { tahun };
    }

    return { tahun, bulan };
  }

  async handle(ws: WebSocket, req: IncomingMessage, context: WsContext): Promise<void> {
    const filter = this.parseFilter(req.url ?? "");
    await this.chatbotMonitoringWsManager.tambahKoneksi(ws, context.sesiPengguna!.sessionId!, filter);
  }
}
