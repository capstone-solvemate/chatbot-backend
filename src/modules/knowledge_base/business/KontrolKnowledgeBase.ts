import type { Request, Response } from "express";

import fs from "node:fs/promises";
import { v4 as uuidv4 } from "uuid";

import type { RepositoriKnowledgeBase } from "../data/RepositoriKnowledgeBase.js";
import type { KnowledgeBase } from "../domain/KnowledgeBase.js";
import type { PesanDariWorker } from "../domain/PesanKnowledgeBaseWorker.js";
import type { KnowledgeBaseResponseDto } from "./dto/KnowledgeBaseResponseDto.js";

import { StatusKnowledgeBase } from "../domain/StatusKnowledgeBase.js";
import { toResponseDto } from "./dto/converters.js";
import { validasiUploadDokumen } from "./dto/validators.js";

export class KontrolKnowledgeBase {
  constructor(
    private readonly repositori: RepositoriKnowledgeBase,
  ) {}

  /**
   * Handler pesan balik dari KnowledgeBaseWorker.
   * Didaftarkan ke KnowledgeBaseWorkerClient saat DI meng-instantiate client.
   *
   * Dipanggil oleh worker client di main thread — aman mengakses repositori.
   */
  async tanganiPesanWorker(pesan: PesanDariWorker): Promise<void> {
    const idDokumen = BigInt(pesan.idDokumen);

    switch (pesan.tipe) {
      case "mulai":
        await this.repositori.updateStatus(idDokumen, StatusKnowledgeBase.SedangDiproses);
        break;

      case "selesai":
        await this.repositori.updateStatus(idDokumen, StatusKnowledgeBase.SelesaiDiproses);
        break;

      case "gagal":
        console.error(
          new Date().toISOString(),
          `[KontrolKnowledgeBase] Indexing gagal. idDokumen=${idDokumen}, errorCode=${pesan.errorCode}`,
        );
        await this.repositori.updateStatus(idDokumen, StatusKnowledgeBase.GagalDiproses);
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

  async hapusDokumen(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    const dokumen = await this.repositori.getDokumenById(id);

    if (!dokumen) {
      res.status(404).json({ error: "not_found", message: "Dokumen tidak ditemukan" });
      return;
    }

    try {
      await fs.unlink(dokumen.path);
    }
    catch (fsError) {
      console.error("File fisik tidak ditemukan atau gagal dihapus:", fsError);
    }

    await this.repositori.hapusDokumen(id);
    res.status(200).json({ message: "Dokumen berhasil dihapus" });
  }
}
