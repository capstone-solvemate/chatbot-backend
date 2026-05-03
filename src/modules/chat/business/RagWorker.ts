/**
 * RagWorker — berjalan di worker thread terpisah.
 *
 * Tanggung jawab:
 * - Menerima tugas RAG dari main thread via parentPort
 * - Memproses antrian secara serial FIFO (1 prompt dalam 1 waktu)
 * - Melakukan HTTP POST ke RAG API dengan retry maksimal 3x
 * - Mengirim hasil (ok/error) balik ke main thread via parentPort
 *
 * Worker ini TIDAK mengakses DB maupun ChatWsManager —
 * kedua hal tersebut ditangani oleh main thread.
 */

import { parentPort, workerData } from "node:worker_threads";

import type { RagConfig } from "~/core/config/domain/RagConfig.js";

import type { PesanDariWorkerRag, PesanKeWorkerRag, RiwayatRag } from "../domain/PesanRagWorker.js";

const config: RagConfig = workerData;
const MAX_RETRY = 3;

// Antrian FIFO
const antrian: PesanKeWorkerRag[] = [];
let sedangMemproses = false;

async function kirimKeRag(history: RiwayatRag[], percobaan: number = 1): Promise<string> {
  const response = await fetch(`${config.url}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ k: config.k, history }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: response.statusText }));
    const detail = (errorBody as any)?.detail ?? response.statusText;

    // 404 dan 422 tidak perlu retry — kesalahan data, bukan transient
    if (response.status === 404 || response.status === 422) {
      throw new Error(detail);
    }

    // 503 dan 500 — transient, retry
    if (percobaan < MAX_RETRY) {
      return kirimKeRag(history, percobaan + 1);
    }

    throw new Error(detail);
  }

  const data = await response.json() as { answer: string };
  return data.answer;
}

async function prosesAntrian(): Promise<void> {
  if (sedangMemproses || antrian.length === 0)
    return;

  sedangMemproses = true;
  const tugas = antrian.shift()!;

  try {
    const jawaban = await kirimKeRag(tugas.history);
    const hasil: PesanDariWorkerRag = {
      status: "ok",
      idChat: tugas.idChat,
      jawaban,
    };
    parentPort!.postMessage(hasil);
  }
  catch (error: any) {
    const gagal: PesanDariWorkerRag = {
      status: "error",
      idChat: tugas.idChat,
      pesanError: error.message ?? "Terjadi kesalahan saat menghubungi layanan RAG",
    };
    parentPort!.postMessage(gagal);
  }
  finally {
    sedangMemproses = false;
    // Proses tugas berikutnya jika ada
    prosesAntrian();
  }
}

parentPort!.on("message", (tugas: PesanKeWorkerRag) => {
  antrian.push(tugas);
  prosesAntrian();
});
