import type { ChatEventBus } from "~/modules/chatbot/event/ChatEventBus.js";
import type { EventChatDibuatPayload } from "~/modules/chatbot/event/payload/EventChatDibuatPayload.js";
import type { EventPesanChatBaruPayload } from "~/modules/chatbot/event/payload/EventPesanChatBaruPayload.js";
import type { EventStatusTiketDiubahPayload } from "~/modules/tiket/event/payload/EventStatusTiketDiubahPayload.js";
import type { EventTiketDibuatPayload } from "~/modules/tiket/event/payload/EventTiketDibuatPayload.js";
import type { TiketEventBus } from "~/modules/tiket/event/TiketEventBus";

import type { ChatbotMonitoringWsManager } from "../business/ChatbotMonitoringWsManager.js";
import type { DashboardWsManager } from "../business/DashboardWsManager.js";

/**
 * DashboardSubscriber — subscribe ke TiketEventBus dan ChatEventBus,
 * lalu trigger broadcast ke WS manager yang sesuai.
 *
 * Trigger:
 *   tiket_dibuat  → DashboardWsManager + ChatbotMonitoringWsManager (unanswered)
 *   status_diubah → DashboardWsManager (open tickets berubah)
 *   chat_dibuat   → DashboardWsManager + ChatbotMonitoringWsManager
 *   pesan_baru    → ChatbotMonitoringWsManager (total pesan, avg)
 */
export class DashboardSubscriber {
  constructor(
    private readonly tiketEventBus: TiketEventBus,
    private readonly chatEventBus: ChatEventBus,
    private readonly dashboardWsManager: DashboardWsManager,
    private readonly chatbotMonitoringWsManager: ChatbotMonitoringWsManager,
  ) {}

  registerSubscribers(): void {
    this.tiketEventBus.on("tiket_dibuat", p => this.onTiketDibuat(p));
    this.tiketEventBus.on("status_diubah", p => this.onStatusDiubah(p));
    this.chatEventBus.on("chat_dibuat", p => this.onChatDibuat(p));
    this.chatEventBus.on("pesan_baru", p => this.onPesanBaru(p));
  }

  private onTiketDibuat(_payload: EventTiketDibuatPayload): void {
    const tanggal = new Date();
    this.dashboardWsManager.broadcastJikaCocok(tanggal).catch(err =>
      console.error(new Date().toISOString(), "[DashboardSubscriber] onTiketDibuat dashboard error:", err),
    );
    this.chatbotMonitoringWsManager.broadcastJikaCocok(tanggal).catch(err =>
      console.error(new Date().toISOString(), "[DashboardSubscriber] onTiketDibuat chatbot error:", err),
    );
  }

  private onStatusDiubah(_payload: EventStatusTiketDiubahPayload): void {
    const tanggal = new Date();
    this.dashboardWsManager.broadcastJikaCocok(tanggal).catch(err =>
      console.error(new Date().toISOString(), "[DashboardSubscriber] onStatusDiubah error:", err),
    );
  }

  private onChatDibuat(payload: EventChatDibuatPayload): void {
    const tanggal = payload.tanggalDibuat;
    this.dashboardWsManager.broadcastJikaCocok(tanggal).catch(err =>
      console.error(new Date().toISOString(), "[DashboardSubscriber] onChatDibuat dashboard error:", err),
    );
    this.chatbotMonitoringWsManager.broadcastJikaCocok(tanggal).catch(err =>
      console.error(new Date().toISOString(), "[DashboardSubscriber] onChatDibuat chatbot error:", err),
    );
  }

  private onPesanBaru(payload: EventPesanChatBaruPayload): void {
    const tanggal = payload.tanggalDibuat;
    this.chatbotMonitoringWsManager.broadcastJikaCocok(tanggal).catch(err =>
      console.error(new Date().toISOString(), "[DashboardSubscriber] onPesanBaru error:", err),
    );
  }
}
