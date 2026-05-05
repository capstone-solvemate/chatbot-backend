import type { Sequelize } from "sequelize";

import type { Config } from "~/core/config/domain/Config";

import { ConfigReader } from "~/core/config/business/ConfigReader";
import { createSequelize } from "~/core/db/sequelize";
import { WsSessionRegistry } from "~/core/ws/WsSessionRegistry";
import { createModelChat } from "~/models/ModelChat";
import { createModelPesanChat } from "~/models/ModelPesanChat";
import { ChatWsManager } from "~/modules/chat/business/ChatWsManager";
import { RagWorkerClient } from "~/modules/chat/business/RagWorkerClient";
import { RepositoriChat } from "~/modules/chat/data/RepositoriChat";
import { EmailWorkerClient } from "~/modules/notifikasi/email/business/EmailWorkerClient";

export class DI {
  private static config: Config | null = null;
  static provideConfig(): Config {
    if (!this.config) {
      this.config = new ConfigReader().read();
    }
    return this.config;
  }

  private static sequelize: Sequelize | null = null;
  static provideSequelize(): Sequelize {
    if (!this.sequelize) {
      this.sequelize = createSequelize(this.provideConfig());
    }
    return this.sequelize;
  }

  private static modelChat: ReturnType<typeof createModelChat> | null = null;
  static provideModelChat(): ReturnType<typeof createModelChat> {
    if (!this.modelChat) {
      this.modelChat = createModelChat(this.provideSequelize());
    }
    return this.modelChat;
  }

  private static modelPesanChat: ReturnType<typeof createModelPesanChat> | null = null;
  static provideModelPesanChat(): ReturnType<typeof createModelPesanChat> {
    if (!this.modelPesanChat) {
      this.modelPesanChat = createModelPesanChat(this.provideSequelize());
    }
    return this.modelPesanChat;
  }

  private static repositoriChat: RepositoriChat | null = null;
  static provideRepositoriChat(): RepositoriChat {
    if (!this.repositoriChat) {
      this.repositoriChat = new RepositoriChat(
        this.provideModelChat(),
        this.provideModelPesanChat(),
      );
    }
    return this.repositoriChat;
  }

  private static emailWorkerClient: EmailWorkerClient | null = null;
  static provideEmailWorkerClient(): EmailWorkerClient {
    if (!this.emailWorkerClient) {
      this.emailWorkerClient = new EmailWorkerClient(this.provideConfig().emailConfig);
    }
    return this.emailWorkerClient;
  }

  static provideChatWsManager(): ChatWsManager {
    return ChatWsManager.instance;
  }

  private static ragWorkerClient: RagWorkerClient | null = null;
  static provideRagWorkerClient(): RagWorkerClient {
    if (!this.ragWorkerClient) {
      this.ragWorkerClient = new RagWorkerClient(
        this.provideConfig().ragConfig,
        this.provideChatWsManager(),
        this.provideRepositoriChat(),
      );
    }
    return this.ragWorkerClient;
  }

  static registerWsHandlers(): void {
    WsSessionRegistry.instance.daftarkan(ChatWsManager.instance);
    // WsSessionRegistry.instance.daftarkan(DashboardWsManager.instance);
  }
}
