import { DI } from "~/di/DI.js";
import { WsHandlerChatbotMonitoring } from "~/modules/chatbot_monitoring/api/ws/WsHandlerChatbotMonitoring.js";
import { WsHandlerListenChatBaru } from "~/modules/chatbot/api/ws/WsHandlerListenChatBaru.js";
import { WsHandlerListenChatLama } from "~/modules/chatbot/api/ws/WsHandlerListenChatLama.js";
import { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna.js";

import { authMiddleware } from "./middleware/AuthMiddleware.js";
import { peranMiddleware } from "./middleware/PeranMiddleware.js";
import { WsRouter } from "./types/WsRouter.js";

export class WsRouterAplikasi {
  getRouter(): WsRouter {
    const router = new WsRouter();

    router.route("/api/ws/chat/\\d+", authMiddleware(), peranMiddleware([PeranPengguna.Karyawan]), new WsHandlerListenChatLama(
      DI.provideManajerWsChat(),
    ));

    router.route("/api/ws/chat", authMiddleware(), peranMiddleware([PeranPengguna.Karyawan]), new WsHandlerListenChatBaru(
      DI.provideManajerWsChat(),
    ));

    router.route("/api/ws/chatbot-monitoring", authMiddleware(), peranMiddleware([PeranPengguna.Admin]), new WsHandlerChatbotMonitoring(
      DI.provideChatbotMonitoringWsManager(),
    ));

    return router;
  }
}
