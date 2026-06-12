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
import { createModelLampiran } from "~/models/ModelLampiran";
import { createModelLampiranPesanChat } from "~/models/ModelLampiranPesanChat";
import { createModelNotifikasi } from "~/models/ModelNotifikasi";
import { createModelPengguna } from "~/models/ModelPengguna";
import { createModelPeranPengguna } from "~/models/ModelPeranPengguna";
import { createModelPesanChat } from "~/models/ModelPesanChat";
import { createModelPesanTiket } from "~/models/ModelPesanTiket";
import { createModelResetPassword } from "~/models/ModelResetPassword";
import { createModelSession } from "~/models/ModelSession";
import { createModelTiket } from "~/models/ModelTiket";
import { ManajerWsChat } from "~/modules/chatbot/api/ws/ManajerWsChat";
import { KontrolChat } from "~/modules/chatbot/application/KontrolChat";
import { RagWorkerClient } from "~/modules/chatbot/application/RagWorkerClient";
import { RepositoriChat } from "~/modules/chatbot/data/RepositoriChat";
import { RowConverterChat } from "~/modules/chatbot/data/row/RowConverterChat";
import { ChatEventBus } from "~/modules/chatbot/event/ChatEventBus";
import { ChatbotMonitoringWsManager } from "~/modules/dashboard/business/ChatbotMonitoringWsManager";
import { DashboardWsManager } from "~/modules/dashboard/business/DashboardWsManager";
import { KontrolDashboard } from "~/modules/dashboard/business/KontrolDashboard";
import { RepositoriChatbotMonitoring } from "~/modules/dashboard/data/RepositoriChatbotMonitoring";
import { RepositoriDashboard } from "~/modules/dashboard/data/RepositoriDashboard";
import { DashboardSubscriber } from "~/modules/dashboard/event/DashboardSubscriber";
import { KontrolFaq } from "~/modules/faq/business/KontrolFaq";
import { RepositoriFaq } from "~/modules/faq/data/RepositoriFaq";
import { KnowledgeBaseWorkerClient } from "~/modules/knowledge_base/business/KnowledgeBaseWorkerClient";
import { KontrolKnowledgeBase } from "~/modules/knowledge_base/business/KontrolKnowledgeBase";
import { RepositoriKnowledgeBase } from "~/modules/knowledge_base/data/RepositoriKnowledgeBase";
import { EmailWorkerClient } from "~/modules/notifikasi/email/business/EmailWorkerClient";
import { KontrolNotifikasi } from "~/modules/notifikasi/web/business/KontrolNotifikasi";
import { NotifikasiWsManager } from "~/modules/notifikasi/web/business/NotifikasiWsManager";
import { RepositoriNotifikasi } from "~/modules/notifikasi/web/data/RepositoriNotifikasi";
import { NotifikasiSubscriber } from "~/modules/notifikasi/web/event/NotifikasiSubscriber";
import { KontrolOtentikasi } from "~/modules/otentikasi/business/KontrolOtentikasi";
import { RepositoriSession } from "~/modules/otentikasi/business/RepositoriSession";
import { RepositoriResetPassword } from "~/modules/otentikasi/data/RepositoriResetPassword";
import { LogoutEventBus } from "~/modules/otentikasi/event/LogoutEventBus";
import { KontrolPengguna } from "~/modules/pengguna/business/KontrolPengguna";
import { RepositoriPengguna } from "~/modules/pengguna/data/RepositoriPengguna";
import { KontrolKategori } from "~/modules/settings/kategori/business/KontrolKategori";
import { RepositoriKategori } from "~/modules/settings/kategori/data/RepositoriKategori";
import { KontrolTiket } from "~/modules/tiket/business/KontrolTiket";
import { RepositoriTiket } from "~/modules/tiket/data/RepositoriTiket";
import { TiketEventBus } from "~/modules/tiket/event/TiketEventBus";
import { RepositoriLampiran } from "~/modules/upload/data/RepositoriLampiran";

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

  private static rowConverterChat: RowConverterChat | null = null;
  static provideRowConverterChat(): RowConverterChat {
    if (!this.rowConverterChat) {
      this.rowConverterChat = new RowConverterChat();
    }
    return this.rowConverterChat;
  }

  private static modelLampiranPesanChat: ModelStatic<Model> | null = null;
  static provideModelLampiranPesanChat(): ModelStatic<Model> {
    if (!this.modelLampiranPesanChat) {
      this.modelLampiranPesanChat = createModelLampiranPesanChat(
        this.provideSequelize(),
      );
    }
    return this.modelLampiranPesanChat;
  }

  private static repositoriChat: RepositoriChat | null = null;
  static provideRepositoriChat(): RepositoriChat {
    if (!this.repositoriChat) {
      this.repositoriChat = new RepositoriChat(
        this.provideModelChat(),
        this.provideModelPesanChat(),
        this.provideModelLampiranPesanChat(),
        this.provideRowConverterChat(),
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

  private static logoutEventBus: LogoutEventBus | null = null;
  static provideLogoutEventBus(): LogoutEventBus {
    if (!this.logoutEventBus) {
      this.logoutEventBus = new LogoutEventBus();
    }
    return this.logoutEventBus;
  }

  private static manajerWsChat: ManajerWsChat | null = null;
  static provideManajerWsChat(): ManajerWsChat {
    if (!this.manajerWsChat) {
      this.manajerWsChat = new ManajerWsChat(
        this.provideLogoutEventBus(),
        this.provideKontrolChat(),
      );
    }
    return this.manajerWsChat;
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

  private static chatEventBus: ChatEventBus | null = null;
  static provideChatEventBus(): ChatEventBus {
    if (!this.chatEventBus) {
      this.chatEventBus = new ChatEventBus();
    }
    return this.chatEventBus;
  }

  private static ragWorkerClient: RagWorkerClient | null = null;
  static provideRagWorkerClient(): RagWorkerClient {
    if (!this.ragWorkerClient) {
      this.ragWorkerClient = new RagWorkerClient(
        this.provideConfig().ragConfig,
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
        this.provideTiketEventBus(),
        this.provideRepositoriLampiran(),
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
        this.provideKontrolNotifikasi(),
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
        this.provideRagWorkerClient(),
        this.provideChatEventBus(),
        this.provideRepositoriLampiran(),
      );
    }
    return this.kontrolChat;
  }

  private static modelNotifikasi: ModelStatic<Model<any, any>> | null = null;
  static provideModelNotifikasi(): ModelStatic<Model<any, any>> {
    if (!this.modelNotifikasi) {
      this.modelNotifikasi = createModelNotifikasi(this.provideSequelize());
    }
    return this.modelNotifikasi;
  }

  private static repositoriNotifikasi: RepositoriNotifikasi | null = null;
  static provideRepositoriNotifikasi(): RepositoriNotifikasi {
    if (!this.repositoriNotifikasi) {
      this.repositoriNotifikasi = new RepositoriNotifikasi(
        this.provideModelNotifikasi(),
      );
    }
    return this.repositoriNotifikasi;
  }

  private static tiketEventBus: TiketEventBus | null = null;
  static provideTiketEventBus(): TiketEventBus {
    if (!this.tiketEventBus) {
      this.tiketEventBus = new TiketEventBus();
    }
    return this.tiketEventBus;
  }

  private static notifikasiWsManager: NotifikasiWsManager | null = null;
  static provideNotifikasiWsManager(): NotifikasiWsManager {
    if (!this.notifikasiWsManager) {
      this.notifikasiWsManager = new NotifikasiWsManager();
    }
    return this.notifikasiWsManager;
  }

  private static kontrolNotifikasi: KontrolNotifikasi | null = null;
  static provideKontrolNotifikasi(): KontrolNotifikasi {
    if (!this.kontrolNotifikasi) {
      this.kontrolNotifikasi = new KontrolNotifikasi(
        this.provideRepositoriNotifikasi(),
        this.provideRepositoriPengguna(),
        this.provideEmailWorkerClient(),
        this.provideNotifikasiWsManager(),
      );
    }
    return this.kontrolNotifikasi;
  }

  private static notifikasiSubscriber: NotifikasiSubscriber | null = null;
  static provideNotifikasiSubscriber(): NotifikasiSubscriber {
    if (!this.notifikasiSubscriber) {
      this.notifikasiSubscriber = new NotifikasiSubscriber(
        this.provideTiketEventBus(),
        this.provideKontrolNotifikasi(),
      );
    }
    return this.notifikasiSubscriber;
  }

  private static repositoriDashboard: RepositoriDashboard | null = null;
  static provideRepositoriDashboard(): RepositoriDashboard {
    if (!this.repositoriDashboard) {
      this.repositoriDashboard = new RepositoriDashboard(this.provideSequelize());
    }
    return this.repositoriDashboard;
  }

  private static repositoriChatbotMonitoring: RepositoriChatbotMonitoring | null = null;
  static provideRepositoriChatbotMonitoring(): RepositoriChatbotMonitoring {
    if (!this.repositoriChatbotMonitoring) {
      this.repositoriChatbotMonitoring = new RepositoriChatbotMonitoring(this.provideSequelize());
    }
    return this.repositoriChatbotMonitoring;
  }

  private static kontrolDashboard: KontrolDashboard | null = null;
  static provideKontrolDashboard(): KontrolDashboard {
    if (!this.kontrolDashboard) {
      this.kontrolDashboard = new KontrolDashboard(
        this.provideRepositoriDashboard(),
        this.provideRepositoriChatbotMonitoring(),
      );
    }
    return this.kontrolDashboard;
  }

  private static dashboardWsManager: DashboardWsManager | null = null;
  static provideDashboardWsManager(): DashboardWsManager {
    if (!this.dashboardWsManager) {
      this.dashboardWsManager = new DashboardWsManager(this.provideKontrolDashboard());
    }
    return this.dashboardWsManager;
  }

  private static chatbotMonitoringWsManager: ChatbotMonitoringWsManager | null = null;
  static provideChatbotMonitoringWsManager(): ChatbotMonitoringWsManager {
    if (!this.chatbotMonitoringWsManager) {
      this.chatbotMonitoringWsManager = new ChatbotMonitoringWsManager(this.provideKontrolDashboard());
    }
    return this.chatbotMonitoringWsManager;
  }

  private static dashboardSubscriber: DashboardSubscriber | null = null;
  static provideDashboardSubscriber(): DashboardSubscriber {
    if (!this.dashboardSubscriber) {
      this.dashboardSubscriber = new DashboardSubscriber(
        this.provideTiketEventBus(),
        this.provideChatEventBus(),
        this.provideDashboardWsManager(),
        this.provideChatbotMonitoringWsManager(),
      );
    }
    return this.dashboardSubscriber;
  }

  // --- Lampiran / Upload ---

  private static modelLampiran: ReturnType<typeof createModelLampiran> | null = null;
  static provideModelLampiran(): ReturnType<typeof createModelLampiran> {
    if (!this.modelLampiran) {
      this.modelLampiran = createModelLampiran(this.provideSequelize());
    }
    return this.modelLampiran;
  }

  private static repositoriLampiran: RepositoriLampiran | null = null;
  static provideRepositoriLampiran(): RepositoriLampiran {
    if (!this.repositoriLampiran) {
      this.repositoriLampiran = new RepositoriLampiran(
        this.provideModelLampiran(),
      );
    }
    return this.repositoriLampiran;
  }

  static registerWsHandlers(): void {
    WsSessionRegistry.instance.daftarkan(this.provideNotifikasiWsManager());
    WsSessionRegistry.instance.daftarkan(this.provideDashboardWsManager());
    WsSessionRegistry.instance.daftarkan(this.provideChatbotMonitoringWsManager());
  }
}
