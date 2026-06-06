import type { Request, Response } from "express";

import fs from "node:fs/promises";
import { v4 as uuidv4 } from "uuid";

import type { RagConfig } from "~/core/config/domain/RagConfig.js";

import type { RepositoriKnowledgeBase } from "../data/RepositoriKnowledgeBase.js";
import type { KnowledgeBase } from "../domain/KnowledgeBase.js";
import type { PesanDariWorker } from "../domain/PesanKnowledgeBaseWorker.js";
import type { KnowledgeBaseResponseDto } from "./dto/KnowledgeBaseResponseDto.js";

import { StatusKnowledgeBase } from "../domain/StatusKnowledgeBase.js";
import { toResponseDto } from "./dto/converters.js";
import { validasiEditDokumen, validasiUploadDokumen } from "./dto/validators.js";
import type { KontrolNotifikasi } from "~/modules/notifikasi/web/business/KontrolNotifikasi.js";

export class KontrolKnowledgeBase {
  constructor(
    private readonly repositori: RepositoriKnowledgeBase,
    private readonly ragConfig: RagConfig,
    private readonly kontrolNotifikasi: KontrolNotifikasi,
  ) {}

  /**
   * Handler pesan balik dari KnowledgeBaseWorker.
   * Didaftarkan ke KnowledgeBaseWorkerClient saat DI meng-instantiate client.
   *
   * Dipanggil oleh worker client di main thread — aman mengakses repositori.
   */
  async tanganiPesanWorker(pesan: PesanDariWorker): Promise<void> {
    const idDokumen = BigInt(pesan.idDokumen);
    const dokumen = await this.repositori.getDokumenById(idDokumen);

    switch (pesan.tipe) {
      case "mulai":
        await this.repositori.updateStatus(idDokumen, StatusKnowledgeBase.SedangDiproses);
        break;

      case "selesai":
        await this.repositori.updateStatus(idDokumen, StatusKnowledgeBase.SelesaiDiproses);
        if (dokumen) await this.kontrolNotifikasi.tanganiKnowledgeBaseSelesai(dokumen.judul);
        break;

      case "gagal":
        console.error(
          new Date().toISOString(),
          `[KontrolKnowledgeBase] Indexing gagal. idDokumen=${idDokumen}, errorCode=${pesan.errorCode}`,
        );
        await this.repositori.updateStatus(idDokumen, StatusKnowledgeBase.GagalDiproses);
        if (dokumen) await this.kontrolNotifikasi.tanganiKnowledgeBaseGagal(dokumen.judul, pesan.errorCode);
        break;
    }
  }

  async getSemuaDokumen(req: Request, res: Response): Promise<void> {
    const idKategori = req.query.idKategori
      ? Number.parseInt(req.query.idKategori as string)
      : undefined;
    const judul = req.query.judul as string | undefined;

    const dokumen = await this.repositori.getSemuaDokumen({
      idKategori: idKategori !== undefined && !Number.isNaN(idKategori) ? idKategori : undefined,
      judul,
    });

    const response: KnowledgeBaseResponseDto[] = dokumen.map(toResponseDto);
    res.status(200).json(response);
  }

  async uploadDokumen(req: Request, res: Response): Promise<void> {
    const dto = validasiUploadDokumen(req);

    const knowledgeBase: KnowledgeBase = {
      id: 0n,
      docId: uuidv4(),
      judul: dto.judul,
      idKategori: dto.idKategori,
      namaBerkas: dto.file.originalname,
      ukuranBerkas: dto.file.size,
      path: dto.file.path,
      status: StatusKnowledgeBase.BelumDiproses,
    };

    const dokumen = await this.repositori.buatDokumen(knowledgeBase);

    // Delegasikan indexing ke worker thread — non-blocking.
    // Worker akan kirim balik pesan "mulai" / "selesai" / "gagal"
    // yang ditangani oleh tanganiPesanWorker() di atas.
    const { DI } = await import("~/di/DI.js");
    DI.provideKnowledgeBaseWorkerClient().proses({
      idDokumen: dokumen.id,
      docId: dokumen.docId,
      namaBerkas: dokumen.namaBerkas,
      path: dokumen.path,
    });

    res.status(201).json({
      message: "File berhasil diunggah dan masuk antrian pemrosesan",
      dokumen: toResponseDto(dokumen),
    });
  }

  async editDokumen(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    const dto = validasiEditDokumen(req);

    const dokumen = await this.repositori.getDokumenById(id);
    if (!dokumen) {
      res.status(404).json({ error: "not_found", message: "Dokumen tidak ditemukan" });
      return;
    }

    // Tolak edit jika dokumen sedang dalam antrian atau sedang diproses
    const statusDitolak = [
      StatusKnowledgeBase.BelumDiproses,
      StatusKnowledgeBase.SedangDiproses,
    ];
    if (statusDitolak.includes(dokumen.status)) {
      res.status(409).json({
        error: "conflict",
        message: "Dokumen belum atau sedang dalam proses indexing dan tidak dapat diedit.",
      });
      return;
    }

    if (dto.file) {
      // --- File replacement: delete old RAG vectors, swap file, re-index ---

      // 1. Hapus vektor lama dari RAG (jika sudah pernah diproses)
      if (dokumen.status === StatusKnowledgeBase.SelesaiDiproses) {
        await this.hapusDariRag(dokumen.docId);
      }

      // 2. Hapus file fisik lama
      try {
        await fs.unlink(dokumen.path);
      } catch (fsError) {
        console.error(
          new Date().toISOString(),
          "[KontrolKnowledgeBase] File fisik lama tidak ditemukan atau gagal dihapus:",
          fsError,
        );
      }

      // 3. Update DB dengan docId baru + info file baru
      const newDocId = uuidv4();
      const updated = await this.repositori.updateDokumen(id, {
        judul: dto.judul,
        idKategori: dto.idKategori,
        docId: newDocId,
        namaBerkas: dto.file.originalname,
        ukuranBerkas: dto.file.size,
        path: dto.file.path,
        status: StatusKnowledgeBase.BelumDiproses,
      });

      if (!updated) {
        res.status(500).json({ error: "internal_error", message: "Gagal memperbarui dokumen" });
        return;
      }

      // 4. Kirim ke worker untuk re-indexing
      const { DI } = await import("~/di/DI.js");
      DI.provideKnowledgeBaseWorkerClient().proses({
        idDokumen: updated.id,
        docId: newDocId,
        namaBerkas: updated.namaBerkas,
        path: updated.path,
      });

      res.status(200).json({
        message: "Dokumen berhasil diperbarui dan masuk antrian pemrosesan ulang",
        dokumen: toResponseDto(updated),
      });
    } else {
      // --- Metadata-only update ---
      const updated = await this.repositori.updateDokumen(id, {
        judul: dto.judul,
        idKategori: dto.idKategori,
      });

      if (!updated) {
        res.status(500).json({ error: "internal_error", message: "Gagal memperbarui dokumen" });
        return;
      }

      res.status(200).json({
        message: "Metadata dokumen berhasil diperbarui",
        dokumen: toResponseDto(updated),
      });
    }
  }

  async hapusDokumen(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    const dokumen = await this.repositori.getDokumenById(id);

    if (!dokumen) {
      res.status(404).json({ error: "not_found", message: "Dokumen tidak ditemukan" });
      return;
    }

    // Hanya dokumen yang sudah selesai diproses atau gagal yang boleh dihapus.
    // BelumDiproses  → dokumen baru masuk antrian, belum tentu belum diproses worker.
    // SedangDiproses → worker sedang aktif mengindex, state RAG tidak konsisten jika dihapus.
    const statusDitolak = [
      StatusKnowledgeBase.BelumDiproses,
      StatusKnowledgeBase.SedangDiproses,
    ];
    if (statusDitolak.includes(dokumen.status)) {
      res.status(409).json({
        error: "conflict",
        message: "Dokumen belum atau sedang dalam proses indexing dan tidak dapat dihapus.",
      });
      return;
    }

    if (dokumen.status === StatusKnowledgeBase.SelesaiDiproses) {
      await this.hapusDariRag(dokumen.docId);
    }

    try {
      await fs.unlink(dokumen.path);
    }
    catch (fsError) {
      console.error(
        new Date().toISOString(),
        "[KontrolKnowledgeBase] File fisik tidak ditemukan atau gagal dihapus:",
        fsError,
      );
    }

    await this.repositori.hapusDokumen(id);
    res.status(200).json({ message: "Dokumen berhasil dihapus" });
  }

  /**
   * Menghapus dokumen dari RAG API secara synchronous.
   * Melempar Error jika RAG mengembalikan response non-2xx,
   * sehingga caller (hapusDokumen) dapat membatalkan operasi hapus.
   */
  private async hapusDariRag(docId: string): Promise<void> {
    const url = `${this.ragConfig.url}/knowledge-base/${encodeURIComponent(docId)}`;

    let response: globalThis.Response;
    try {
      response = await fetch(url, { method: "DELETE" });
    }
    catch (err) {
      console.error(
        new Date().toISOString(),
        `[KontrolKnowledgeBase] Gagal menghubungi RAG API saat menghapus docId=${docId}:`,
        err,
      );
      throw new Error("Gagal menghubungi RAG API. Dokumen tidak dihapus.");
    }

    if (response.status === 404) {
      // Dokumen tidak ditemukan di RAG — kemungkinan sudah terhapus sebelumnya.
      // Anggap kondisi ini sudah bersih, lanjutkan hapus dari DB.
      console.warn(
        new Date().toISOString(),
        `[KontrolKnowledgeBase] Dokumen tidak ditemukan di RAG (404), lanjut hapus dari DB. docId=${docId}`,
      );
      return;
    }

    if (!response.ok) {
      const body = await response.json().catch(() => null) as any;
      const detail = body?.detail ?? response.statusText;
      console.error(
        new Date().toISOString(),
        `[KontrolKnowledgeBase] RAG API menolak penghapusan docId=${docId}. HTTP ${response.status}: ${detail}`,
      );
      throw new Error(`RAG API mengembalikan error ${response.status} saat menghapus dokumen.`);
    }

    console.info(
      new Date().toISOString(),
      `[KontrolKnowledgeBase] Dokumen berhasil dihapus dari RAG. docId=${docId}`,
    );
  }
}
