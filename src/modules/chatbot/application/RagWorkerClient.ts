import path from "node:path";
import { Worker } from "node:worker_threads";

import type { RagConfig } from "~/core/config/domain/RagConfig.js";

import type { RepositoriChat } from "../data/RepositoriChat.js";
import type { PesanDariWorkerRag, PesanKeWorkerRag, RiwayatRag } from "../domain/PesanRagWorker.js";

export class RagWorkerClient {
  private worker: Worker | null = null;

  private callbackHasilSiap: ((idChat: bigint, pesan: string) => void) | null = null;

  constructor(
    private readonly config: RagConfig,
    // private readonly manajerWsChat: ManajerWsChat,
    private readonly repositoriChat: RepositoriChat,
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
      return path.join(projectRoot, "build", "src", "modules", "chatbot", "application", "RagWorker.js");
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
          // this.manajerWsChat.broadcast(idChat, {
          //   type: "error",
          //   pesan: hasil.pesanError,
          // });
        })
        .catch((err) => {
          console.error(
            new Date().toISOString(),
            "[RagWorkerClient] Gagal menangani hasil error dari worker:",
            err,
          );
        });
    }
    else {
      this.callbackHasilSiap?.(idChat, hasil.jawaban);
    }
  }

  setCallbackHasilSiap(callback: (idChat: bigint, pesan: string) => void) {
    this.callbackHasilSiap = callback;
  }

  berhenti(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
