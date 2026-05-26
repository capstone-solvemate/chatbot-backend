import path from "node:path";
import { Worker } from "node:worker_threads";

import type { RagConfig } from "~/core/config/domain/RagConfig.js";

import type { ChatWsManager } from "../api/ws/ChatWsManager.js";
import type { RepositoriChat } from "../data/RepositoriChat.js";
import type { PesanDariWorkerRag, PesanKeWorkerRag, RiwayatRag } from "../domain/PesanRagWorker.js";
import type { ChatEventBus } from "../event/ChatEventBus.js";

export class RagWorkerClient {
  private worker: Worker | null = null;

  constructor(
    private readonly config: RagConfig,
    private readonly chatWsManager: ChatWsManager,
    private readonly repositoriChat: RepositoriChat,
    private readonly chatEventBus: ChatEventBus,
  ) {}

  tambahTugas(idChat: bigint, history: RiwayatRag[]): void {
    this.repositoriChat.mulaiProsesChat(idChat).catch((err) => {
      console.error(
        new Date().toISOString(),
        "[RagWorkerClient] Gagal set sedang_diproses:",
        err,
      );
    });

    const worker = this.pastikanWorkerJalan();
    const pesan: PesanKeWorkerRag = {
      idChat: idChat.toString(),
      history,
    };
    worker.postMessage(pesan);
  }

  private resolveWorkerPath(): string {
    const isDev = __filename.endsWith(".ts");

    if (isDev) {
      const projectRoot = path.resolve(__dirname, "../../../../");
      return path.join(projectRoot, "dist", "src", "modules", "chat", "business", "RagWorker.js");
    }

    return path.resolve(__dirname, "RagWorker.js");
  }

  private pastikanWorkerJalan(): Worker {
    if (this.worker)
      return this.worker;

    const workerPath = this.resolveWorkerPath();

    this.worker = new Worker(workerPath, {
      workerData: this.config,
    });

    this.worker.on("message", (hasil: PesanDariWorkerRag) => {
      this.tanganiHasil(hasil);
    });

    this.worker.on("error", (err) => {
      console.error(
        new Date().toISOString(),
        "[RagWorkerClient] Worker mengalami error tidak tertangani:",
        err,
      );
      this.worker = null;
    });

    this.worker.on("exit", (kode) => {
      if (kode !== 0) {
        console.error(
          new Date().toISOString(),
          `[RagWorkerClient] Worker keluar dengan kode ${kode}. Akan di-restart saat request berikutnya.`,
        );
      }
      this.worker = null;
    });

    return this.worker;
  }

  private tanganiHasil(hasil: PesanDariWorkerRag): void {
    const idChat = BigInt(hasil.idChat);

    if (hasil.status === "error") {
      this.repositoriChat.selesaiProsesChat(idChat)
        .then(() => this.repositoriChat.tandaiPesanTerakhirGagal(idChat))
        .then(() => {
          this.chatWsManager.broadcast(idChat, {
            type: "error",
            pesan: hasil.pesanError,
          });
        })
        .catch((err) => {
          console.error(
            new Date().toISOString(),
            "[RagWorkerClient] Gagal menangani hasil error dari worker:",
            err,
          );
        });
    }

    // this.repositoriChat
    //   .buatPesanChat(idChat, hasil.jawaban, true)
    //   .then((pesanAsisten) => {
    //     return this.repositoriChat.selesaiProsesChat(idChat).then(() => pesanAsisten);
    //   })
    //   .then((pesanAsisten) => {
    //     // Fetch chat untuk dapatkan idPembuat sebelum emit event
    //     return this.repositoriChat.getChatById(idChat).then((chat) => {
    //       if (chat) {
    //         this.chatEventBus.emit("pesan_baru", {
    //           idChat,
    //           idPembuat: chat.idPembuat,
    //           tanggalDibuat: pesanAsisten.tanggalDibuat,
    //         });
    //       }
    //       return pesanAsisten;
    //     });
    //   })
    //   .then((pesanAsisten) => {
    //     this.chatWsManager.broadcast(idChat, {
    //       type: "jawaban",
    //       pesan: {
    //         id: pesanAsisten.id.toString(),
    //         pesan: pesanAsisten.pesan,
    //         tanggalDibuat: pesanAsisten.tanggalDibuat,
    //       },
    //     });
    //   })
    //   .catch((err) => {
    //     console.error(
    //       new Date().toISOString(),
    //       "[RagWorkerClient] Gagal menyimpan jawaban ke DB:",
    //       err,
    //     );
    //     this.chatWsManager.broadcast(idChat, {
    //       type: "error",
    //       pesan: "Gagal menyimpan jawaban. Silakan coba lagi.",
    //     });
    //   });
  }

  berhenti(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
