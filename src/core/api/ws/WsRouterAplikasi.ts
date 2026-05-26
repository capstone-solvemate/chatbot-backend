import { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna.js";

import { authMiddleware } from "./middleware/AuthMiddleware.js";
import { peranMiddleware } from "./middleware/PeranMiddleware.js";
import { WsRouter } from "./types/WsRouter.js";

export class WebSocketRouterAplikasi {
  getRouter(): WsRouter {
    const router = new WsRouter();

    router.route("/api/chat/ws", authMiddleware(), peranMiddleware([PeranPengguna.Karyawan]));

    return router;
  }
}
