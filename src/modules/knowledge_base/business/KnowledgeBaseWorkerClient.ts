import path from "node:path";
import { Worker } from "node:worker_threads";

import type { RagConfig } from "~/core/config/domain/RagConfig.js";

import type { PesanDariWorker, PesanKeWorker } from "../domain/PesanKnowledgeBaseWorker.js";

export type HandlerPesanWorker = (pesan: PesanDariWorker) => void;

/**
 * KnowledgeBaseWorkerClient — jembatan antara main thread dan KnowledgeBaseWorker.
 *
 * Tanggung jawab:
 *   - Spawn worker thread dan meneruskan perintah "proses" / "berhenti".
 *   - Menerima pesan balik dari worker (mulai / selesai / gagal) dan
 *     meneruskannya ke handler yang didaftarkan oleh KontrolKnowledgeBase.
 *
 * KontrolKnowledgeBase mendaftarkan handler lewat konstruktor DI,
 * sehingga semua perubahan status ke DB tetap dilakukan oleh kontrol
 * melalui repositori — worker tidak menyentuh database sama sekali.
 *
 * Penggunaan:
 *   const client = DI.provideKnowledgeBaseWorkerClient();
 *   client.proses({ idDokumen, docId, namaBerkas, path });
 */
export class KnowledgeBaseWorkerClient {
  private worker: Worker | null = null;

  constructor(
    private readonly ragConfig: RagConfig,
    private readonly onPesan: HandlerPesanWorker,
  ) {}

  /**
   * Kirim permintaan indexing ke worker thread.
   * Non-blocking — main thread tidak menunggu indexing selesai.
   */
  proses(params: {
    idDokumen: bigint;
    docId: string;
    namaBerkas: string;
    path: string;
  }): void {
    const worker = this.pastikanWorkerJalan();
    const pesan: PesanKeWorker = {
      tipe: "proses",
      idDokumen: params.idDokumen.toString(),
      docId: params.docId,
      namaBerkas: params.namaBerkas,
      path: params.path,
    };
    worker.postMessage(pesan);
  }

  /**
   * Hentikan worker thread dengan bersih saat aplikasi shutdown.
   * Worker menyelesaikan antrian yang ada sebelum exit.
   */
  berhenti(): void {
    if (this.worker) {
      const pesan: PesanKeWorker = { tipe: "berhenti" };
      this.worker.postMessage(pesan);
      this.worker = null;
    }
  }

  private resolveWorkerPath(): string {
    const isDev = __filename.endsWith(".ts");

    if (isDev) {
      // Development: __dirname → src/modules/knowledge_base/business/
      // Naik ke root proyek, lalu masuk ke dist/
      const projectRoot = path.resolve(__dirname, "../../../../");
      return path.join(projectRoot, "dist", "src", "modules", "knowledge_base", "business", "KnowledgeBaseWorker.js");
    }

    // Production: __dirname sudah di dist/src/modules/knowledge_base/business/
    return path.resolve(__dirname, "KnowledgeBaseWorker.js");
  }

  private pastikanWorkerJalan(): Worker {
    if (this.worker) {
      return this.worker;
    }

    const workerPath = this.resolveWorkerPath();

    this.worker = new Worker(workerPath, {
      workerData: { ragUrl: this.ragConfig.url },
    });

    // Teruskan pesan balik dari worker ke handler (KontrolKnowledgeBase)
    this.worker.on("message", (pesan: PesanDariWorker) => {
      this.onPesan(pesan);
    });

    this.worker.on("error", (err) => {
      console.error(
        new Date().toISOString(),
        "[KnowledgeBaseWorkerClient] Worker mengalami error tidak tertangani:",
        err,
      );
      this.worker = null;
    });

    this.worker.on("exit", (kode) => {
      if (kode !== 0) {
        console.error(
          new Date().toISOString(),
          `[KnowledgeBaseWorkerClient] Worker keluar dengan kode ${kode}. Akan di-restart saat request berikutnya.`,
        );
      }
      this.worker = null;
    });

    return this.worker;
  }
}
