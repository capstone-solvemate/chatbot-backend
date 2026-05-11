/**
 * KnowledgeBaseWorker — berjalan di worker thread terpisah.
 *
 * Tanggung jawab worker ini hanya dua:
 *   1. Memanggil RAG API POST /knowledge-base untuk indexing dokumen.
 *   2. Memberitahu main thread via parentPort tentang status pemrosesan.
 *
 * Worker TIDAK menyentuh database sama sekali — semua perubahan status
 * dilakukan oleh main thread (KontrolKnowledgeBase) lewat repositori.
 *
 * Protokol pesan:
 *   main → worker : { tipe: "proses", idDokumen, docId, namaBerkas, path }
 *   main → worker : { tipe: "berhenti" }
 *   worker → main : { tipe: "mulai", idDokumen }      ← sebelum fetch RAG
 *   worker → main : { tipe: "selesai", idDokumen }    ← RAG berhasil
 *   worker → main : { tipe: "gagal", idDokumen, errorCode } ← RAG gagal
 *
 * workerData yang diharapkan: { ragUrl: string }
 */

import { parentPort, workerData } from "node:worker_threads";

import type { PesanDariWorker, PesanKeWorker } from "../domain/PesanKnowledgeBaseWorker.js";

if (!parentPort) {
  throw new Error("[KnowledgeBaseWorker] Harus dijalankan sebagai worker thread.");
}

const ragUrl: string = workerData.ragUrl;

// ─── Kirim pesan ke main thread ───────────────────────────────────────────────

function kirimKeParent(pesan: PesanDariWorker): void {
  parentPort!.postMessage(pesan);
}

// ─── Panggil RAG API ──────────────────────────────────────────────────────────

async function indeksDokumen(
  idDokumen: string,
  docId: string,
  namaBerkas: string,
  filePath: string,
): Promise<void> {
  // Beritahu parent bahwa dokumen ini mulai diproses
  kirimKeParent({ tipe: "mulai", idDokumen });

  try {
    const response = await fetch(`${ragUrl}/knowledge-base`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doc_id: docId,
        file_name: namaBerkas,
        file_path: filePath,
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null) as any;
      const errorCode: string = body?.detail?.error_code ?? "UNKNOWN";
      console.error(
        new Date().toISOString(),
        `[KnowledgeBaseWorker] RAG API error. docId=${docId}, HTTP ${response.status}, error_code=${errorCode}`,
      );
      kirimKeParent({ tipe: "gagal", idDokumen, errorCode });
      return;
    }

    console.info(
      new Date().toISOString(),
      `[KnowledgeBaseWorker] Dokumen berhasil diindex. docId=${docId}`,
    );
    kirimKeParent({ tipe: "selesai", idDokumen });
  }
  catch (err) {
    console.error(
      new Date().toISOString(),
      `[KnowledgeBaseWorker] Error tidak tertangani saat indexing docId=${docId}:`,
      err,
    );
    kirimKeParent({ tipe: "gagal", idDokumen, errorCode: "UNKNOWN" });
  }
}

// ─── Serial queue ─────────────────────────────────────────────────────────────

const antrian: Array<() => Promise<void>> = [];
let sedangBerjalan = false;
let sedangBerhenti = false;

function tambahKeAntrian(tugas: () => Promise<void>): void {
  antrian.push(tugas);
  jalankanAntrian();
}

async function jalankanAntrian(): Promise<void> {
  if (sedangBerjalan)
    return;
  sedangBerjalan = true;

  while (antrian.length > 0) {
    const tugas = antrian.shift()!;
    await tugas();
  }

  sedangBerjalan = false;

  if (sedangBerhenti) {
    process.exit(0);
  }
}

// ─── Listener pesan dari main thread ─────────────────────────────────────────

parentPort.on("message", (pesan: PesanKeWorker) => {
  if (pesan.tipe === "berhenti") {
    sedangBerhenti = true;
    // Jika antrian sudah kosong dan tidak ada yang berjalan, langsung keluar
    if (!sedangBerjalan && antrian.length === 0) {
      process.exit(0);
    }
    // Jika masih ada antrian, jalankanAntrian() akan exit setelah selesai
    return;
  }

  if (pesan.tipe === "proses" && !sedangBerhenti) {
    tambahKeAntrian(() =>
      indeksDokumen(pesan.idDokumen, pesan.docId, pesan.namaBerkas, pesan.path),
    );
  }
});
