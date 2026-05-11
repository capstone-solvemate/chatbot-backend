import type { Model, ModelStatic, Sequelize } from "sequelize";

import type { Config } from "~/core/config/domain/Config";

import { ConfigReader } from "~/core/config/business/ConfigReader";
import { createSequelize } from "~/core/db/sequelize";
import { WsSessionRegistry } from "~/core/ws/WsSessionRegistry";
import { createModelChat } from "~/models/ModelChat";
import { createModelFaq } from "~/models/ModelFaq";
import { createModelFaqSurvei } from "~/models/ModelFaqSurvei";
import { createModelFaqViewLog } from "~/models/ModelFaqViewLog";
import { createModelKategori } from "~/models/ModelKategori";
import { createModelKnowledgeBase } from "~/models/ModelKnowledgeBase";
import { createModelPengguna } from "~/models/ModelPengguna";
import { createModelPeranPengguna } from "~/models/ModelPeranPengguna";
import { createModelPesanChat } from "~/models/ModelPesanChat";
import { createModelPesanTiket } from "~/models/ModelPesanTiket";
import { createModelResetPassword } from "~/models/ModelResetPassword";
import { createModelSession } from "~/models/ModelSession";
import { createModelTiket } from "~/models/ModelTiket";
import { ChatWsManager } from "~/modules/chat/business/ChatWsManager";
import { KontrolChat } from "~/modules/chat/business/KontrolChat";
import { RagWorkerClient } from "~/modules/chat/business/RagWorkerClient";
import { RepositoriChat } from "~/modules/chat/data/RepositoriChat";
import { KontrolFaq } from "~/modules/faq/business/KontrolFaq";
import { RepositoriFaq } from "~/modules/faq/data/RepositoriFaq";
import { KnowledgeBaseWorkerClient } from "~/modules/knowledge_base/business/KnowledgeBaseWorkerClient";
import { KontrolKnowledgeBase } from "~/modules/knowledge_base/business/KontrolKnowledgeBase";
import { RepositoriKnowledgeBase } from "~/modules/knowledge_base/data/RepositoriKnowledgeBase";
import { EmailWorkerClient } from "~/modules/notifikasi/email/business/EmailWorkerClient";
import { KontrolOtentikasi } from "~/modules/otentikasi/business/KontrolOtentikasi";
import { RepositoriSession } from "~/modules/otentikasi/business/RepositoriSession";
import { RepositoriResetPassword } from "~/modules/otentikasi/data/RepositoriResetPassword";
import { KontrolPengguna } from "~/modules/pengguna/business/KontrolPengguna";
import { RepositoriPengguna } from "~/modules/pengguna/data/RepositoriPengguna";
import { KontrolKategori } from "~/modules/settings/kategori/business/KontrolKategori";
import { RepositoriKategori } from "~/modules/settings/kategori/data/RepositoriKategori";
import { KontrolTiket } from "~/modules/tiket/business/KontrolTiket";
import { RepositoriTiket } from "~/modules/tiket/data/RepositoriTiket";

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

  // private static modelPesanChat: ReturnType<typeof createModelPesanChat> | null = null;
  // static provideModelPesanChat(): ReturnType<typeof createModelPesanChat> {
  //   if (!this.modelPesanChat) {
  //     this.modelPesanChat = createModelPesanChat(this.provideSequelize());
  //   }
  //   return this.modelPesanChat;
  // }

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

  private static modelPengguna: ModelStatic<Model<any, any>> | null = null;
  static provideModelPengguna(): ModelStatic<Model<any, any>> {
    if (!this.modelPengguna) {
      this.modelPengguna = createModelPengguna(this.provideSequelize());
    }
    return this.modelPengguna;
  }

  private static modelPeranPengguna: ModelStatic<Model<any, any>> | null = null;
  static provideModelPeranPengguna(): ModelStatic<Model<any, any>> {
    if (!this.modelPeranPengguna) {
      this.modelPeranPengguna = createModelPeranPengguna(this.provideSequelize(), this.provideModelPengguna());
    }
    return this.modelPeranPengguna;
  }

  private static repositoriPengguna: RepositoriPengguna | null = null;
  static provideRepositoriPengguna(): RepositoriPengguna {
    if (!this.repositoriPengguna) {
      this.repositoriPengguna = new RepositoriPengguna(
        this.provideModelPengguna(),
        this.provideModelPeranPengguna(),
      );
    }
    return this.repositoriPengguna;
  }

  private static kontrolPengguna: KontrolPengguna | null = null;
  static provideKontrolPengguna(): KontrolPengguna {
    if (!this.kontrolPengguna) {
      this.kontrolPengguna = new KontrolPengguna(
        this.provideRepositoriPengguna(),
      );
    }
    return this.kontrolPengguna;
  }

  private static modelSession: ModelStatic<Model<any, any>> | null = null;
  static provideModelSession(): ModelStatic<Model<any, any>> {
    if (!this.modelSession) {
      this.modelSession = createModelSession(
        this.provideSequelize(),
        this.provideModelPengguna(),
      );
    }
    return this.modelSession;
  }

  private static repositoriSession: RepositoriSession | null = null;
  static provideRepositoriSession(): RepositoriSession {
    if (!this.repositoriSession) {
      this.repositoriSession = new RepositoriSession(
        this.provideModelSession(),
      );
    }
    return this.repositoriSession;
  }

  private static modelResetPassword: ModelStatic<Model<any, any>> | null = null;
  static provideModelResetPassword(): ModelStatic<Model<any, any>> {
    if (!this.modelResetPassword) {
      this.modelResetPassword = createModelResetPassword(
        this.provideSequelize(),
      );
    }
    return this.modelResetPassword;
  }

  private static modelPesanTiket: ModelStatic<Model<any, any>> | null = null;
  static provideModelPesanTiket(): ModelStatic<Model<any, any>> {
    if (!this.modelPesanTiket) {
      this.modelPesanTiket = createModelPesanTiket(
        this.provideSequelize(),
      );
    }
    return this.modelPesanTiket;
  }

  private static repositoriResetPassword: RepositoriResetPassword | null = null;
  static provideRepositoriResetPassword(): RepositoriResetPassword {
    if (!this.repositoriResetPassword) {
      this.repositoriResetPassword = new RepositoriResetPassword(
        this.provideModelResetPassword(),
      );
    }
    return this.repositoriResetPassword;
  }

  private static kontrolOtentikasi: KontrolOtentikasi | null = null;
  static provideKontrolOtentikasi(): KontrolOtentikasi {
    if (!this.kontrolOtentikasi) {
      this.kontrolOtentikasi = new KontrolOtentikasi(
        this.provideRepositoriPengguna(),
        this.provideRepositoriSession(),
        this.provideRepositoriResetPassword(),
      );
    }
    return this.kontrolOtentikasi;
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

  private static modelTiket: ModelStatic<Model<any, any>> | null = null;
  static provideModelTiket(): ModelStatic<Model<any, any>> {
    if (!this.modelTiket) {
      this.modelTiket = createModelTiket(this.provideSequelize(), this.provideModelPengguna());
    }
    return this.modelTiket;
  }

  private static repositoriTiket: RepositoriTiket | null = null;
  static provideRepositoriTiket(): RepositoriTiket {
    if (!this.repositoriTiket) {
      this.repositoriTiket = new RepositoriTiket(
        this.provideModelTiket(),
        this.provideModelPengguna(),
        this.provideModelPesanTiket(),
        this.provideModelChat(),
        this.provideSequelize(),
      );
    }
    return this.repositoriTiket;
  }

  private static kontrolTiket: KontrolTiket | null = null;
  static provideKontrolTiket(): KontrolTiket {
    if (!this.kontrolTiket) {
      this.kontrolTiket = new KontrolTiket(
        this.provideRepositoriTiket(),
      );
    }
    return this.kontrolTiket;
  }

  private static modelKategori: ModelStatic<Model<any, any>> | null = null;
  static provideModelKategori(): ModelStatic<Model<any, any>> {
    if (!this.modelKategori) {
      this.modelKategori = createModelKategori(this.provideSequelize());
    }
    return this.modelKategori;
  }

  private static repositoriKategori: RepositoriKategori | null = null;
  static provideRepositoriKategori(): RepositoriKategori {
    if (!this.repositoriKategori) {
      this.repositoriKategori = new RepositoriKategori(
        this.provideModelKategori(),
      );
    }
    return this.repositoriKategori;
  }

  private static kontrolKategori: KontrolKategori | null = null;
  static provideKontrolKategori(): KontrolKategori {
    if (!this.kontrolKategori) {
      this.kontrolKategori = new KontrolKategori(
        this.provideRepositoriKategori(),
      );
    }
    return this.kontrolKategori;
  }

  private static modelFaq: ModelStatic<Model<any, any>> | null = null;
  static provideModelFaq(): ModelStatic<Model<any, any>> {
    if (!this.modelFaq) {
      this.modelFaq = createModelFaq(this.provideSequelize());
    }
    return this.modelFaq;
  }

  private static modelFaqViewLog: ModelStatic<Model<any, any>> | null = null;
  static provideModelFaqViewLog(): ModelStatic<Model<any, any>> {
    if (!this.modelFaqViewLog) {
      this.modelFaqViewLog = createModelFaqViewLog(
        this.provideSequelize(),
        this.provideModelFaq(),
        this.provideModelPengguna(),
      );
    }
    return this.modelFaqViewLog;
  }

  private static modelFaqSurvei: ModelStatic<Model<any, any>> | null = null;
  static provideModelFaqSurvei(): ModelStatic<Model<any, any>> {
    if (!this.modelFaqSurvei) {
      this.modelFaqSurvei = createModelFaqSurvei(this.provideSequelize(), this.provideModelFaq(), this.provideModelPengguna());
    }
    return this.modelFaqSurvei;
  }

  private static repositoriFaq: RepositoriFaq | null = null;
  static provideRepositoriFaq(): RepositoriFaq {
    if (!this.repositoriFaq) {
      this.repositoriFaq = new RepositoriFaq(
        this.provideModelFaq(),
        this.provideModelFaqViewLog(),
        this.provideModelFaqSurvei(),
      );
    }
    return this.repositoriFaq;
  }

  private static kontrolFaq: KontrolFaq | null = null;
  static provideKontrolFaq(): KontrolFaq {
    if (!this.kontrolFaq) {
      this.kontrolFaq = new KontrolFaq(this.provideRepositoriFaq());
    }
    return this.kontrolFaq;
  }

  private static modelKnowledgeBase: ModelStatic<Model<any, any>> | null = null;
  static provideModelKnowledgeBase(): ModelStatic<Model<any, any>> {
    if (!this.modelKnowledgeBase) {
      this.modelKnowledgeBase = createModelKnowledgeBase(
        this.provideSequelize(),
      );
    }
    return this.modelKnowledgeBase;
  }

  private static repositoriKnowledgeBase: RepositoriKnowledgeBase | null = null;
  static provideRepositoriKnowledgeBase(): RepositoriKnowledgeBase {
    if (!this.repositoriKnowledgeBase) {
      this.repositoriKnowledgeBase = new RepositoriKnowledgeBase(
        this.provideModelKnowledgeBase(),
      );
    }
    return this.repositoriKnowledgeBase;
  }

  private static kontrolKnowledgeBase: KontrolKnowledgeBase | null = null;
  static provideKontrolKnowledgeBase(): KontrolKnowledgeBase {
    if (!this.kontrolKnowledgeBase) {
      this.kontrolKnowledgeBase = new KontrolKnowledgeBase(
        this.provideRepositoriKnowledgeBase(),
        this.provideConfig().ragConfig,
      );
    }
    return this.kontrolKnowledgeBase;
  }

  private static knowledgeBaseWorkerClient: KnowledgeBaseWorkerClient | null = null;
  static provideKnowledgeBaseWorkerClient(): KnowledgeBaseWorkerClient {
    if (!this.knowledgeBaseWorkerClient) {
      this.knowledgeBaseWorkerClient = new KnowledgeBaseWorkerClient(
        this.provideConfig().ragConfig,
        (pesan) => {
          this.provideKontrolKnowledgeBase().tanganiPesanWorker(pesan).catch((err) => {
            console.error(
              new Date().toISOString(),
              "[DI] Gagal menangani pesan worker knowledge base:",
              err,
            );
          });
        },
      );
    }
    return this.knowledgeBaseWorkerClient;
  }

  private static kontrolChat: KontrolChat | null = null;
  static provideKontrolChat(): KontrolChat {
    if (!this.kontrolChat) {
      this.kontrolChat = new KontrolChat(
        this.provideRepositoriChat(),
        this.provideChatWsManager(),
        this.provideRagWorkerClient(),
      );
    }
    return this.kontrolChat;
  }

  static registerWsHandlers(): void {
    WsSessionRegistry.instance.daftarkan(ChatWsManager.instance);
    // WsSessionRegistry.instance.daftarkan(DashboardWsManager.instance);
  }
}
