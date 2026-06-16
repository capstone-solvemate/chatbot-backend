import path from "node:path";
import { Worker } from "node:worker_threads";

import type { EmailConfig } from "~/core/config/domain/EmailConfig.js";

import type { PesanEmail } from "../domain/PesanEmail.js";
import type { PesanWorkerEmail } from "../domain/PesanWorkerEmail.js";

/**
 * EmailWorkerClient — digunakan oleh parent thread untuk mengirim permintaan
 * email ke worker thread tanpa memblokir event loop.
 *
 * Config SMTP dikirim ke worker lewat workerData saat pertama kali di-spawn,
 * sehingga worker tidak perlu mengakses process.env atau DI secara langsung.
 *
 * Penggunaan:
 *   const client = DI.provideEmailWorkerClient();
 *   client.kirim({ to, subject, html });
 */
export class EmailWorkerClient {
  private worker: Worker | null = null;

  constructor(private readonly config: EmailConfig) {}

  /**
   * Resolve path ke EmailWorker yang kompatibel di dua environment:
   *
   * - Development (`tsx watch`): file .ts dijalankan langsung, __dirname
   *   menunjuk ke src/. Worker di-spawn pakai tsx sebagai execArgv supaya
   *   bisa membaca file .ts.
   *
   * - Production (`node dist/`): file sudah dikompilasi, __dirname menunjuk
   *   ke dist/src/. Worker di-spawn sebagai .js biasa.
   */
  private resolveWorkerPath(): string {
    const isDev = __filename.endsWith(".ts");

    if (isDev) {
    // Development: __dirname → src/workers/email/
    // Naik ke root proyek, lalu masuk ke dist/src/workers/email/
      const projectRoot = path.resolve(__dirname, "../../../../../");
      return path.join(projectRoot, "build", "src", "modules", "notifikasi", "email", "business", "EmailWorker.js");
    }

    // Production: __dirname → dist/src/workers/email/
    return path.resolve(__dirname, "EmailWorker.js");
  }

  /**
   * Kirim permintaan email ke worker thread.
   * Worker akan di-start otomatis jika belum berjalan.
   * Non-blocking — parent thread tidak menunggu email selesai dikirim.
   */
  kirim(pesan: PesanEmail): void {
    const worker = this.pastikanWorkerJalan();
    const perintah: PesanWorkerEmail = { tipe: "kirim", pesan };
    worker.postMessage(perintah);
  }

  /**
   * Hentikan worker thread dengan bersih.
   * Panggil ini saat aplikasi akan shutdown (misalnya di SIGTERM handler).
   * Worker akan menyelesaikan antrian yang ada sebelum berhenti.
   */
  berhenti(): void {
    if (this.worker) {
      const perintah: PesanWorkerEmail = { tipe: "berhenti" };
      this.worker.postMessage(perintah);
      this.worker = null;
    }
  }

  private pastikanWorkerJalan(): Worker {
    if (this.worker) {
      return this.worker;
    }

    const workerPath = this.resolveWorkerPath();

    // Config dikirim lewat workerData — worker menerimanya via workerData dari node:worker_threads
    this.worker = new Worker(workerPath, {
      workerData: this.config,
    });

    this.worker.on("error", (err) => {
      console.error(
        new Date().toISOString(),
        "[EmailWorkerClient] Worker mengalami error tidak tertangani:",
        err,
      );
      this.worker = null;
    });

    this.worker.on("exit", (kode) => {
      if (kode !== 0) {
        console.error(
          new Date().toISOString(),
          `[EmailWorkerClient] Worker keluar dengan kode ${kode}. Akan di-restart saat request berikutnya.`,
        );
      }
      this.worker = null;
    });

    return this.worker;
  }
}
