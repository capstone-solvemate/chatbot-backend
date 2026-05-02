/**
 * EmailWorker — entry point yang dijalankan di worker thread terpisah.
 *
 * Tidak bisa mengakses DI atau Sequelize karena berjalan di thread berbeda.
 * Config SMTP diterima dari parent thread lewat workerData saat worker di-spawn.
 */

import { parentPort, workerData } from "node:worker_threads";

import type { EmailConfig } from "~/core/config/domain/EmailConfig.js";

import type { PesanWorkerEmail } from "../domain/PesanWorkerEmail.js";

import { KirimEmail } from "./KirimEmail.js";

if (!parentPort) {
  throw new Error("EmailWorker harus dijalankan sebagai worker thread, bukan sebagai proses utama.");
}

// Config dikirim dari EmailWorkerClient lewat workerData
const config = workerData as EmailConfig;
const kirimEmail = new KirimEmail(config);

// Antrian sederhana untuk memastikan email diproses serial —
// menghindari flooding SMTP jika pesan datang bersamaan.
let rantaiAntrian: Promise<void> = Promise.resolve();

parentPort.on("message", (pesan: PesanWorkerEmail) => {
  switch (pesan.tipe) {
    case "kirim": {
      rantaiAntrian = rantaiAntrian.then(() => kirimEmail.kirim(pesan.pesan));
      break;
    }

    case "berhenti": {
      rantaiAntrian.then(() => {
        console.log(new Date().toISOString(), "[EmailWorker] Worker berhenti dengan bersih.");
        process.exit(0);
      });
      break;
    }

    default: {
      console.warn(new Date().toISOString(), "[EmailWorker] Menerima pesan tidak dikenal:", pesan);
    }
  }
});

console.log(new Date().toISOString(), "[EmailWorker] Worker siap menerima pesan.");
