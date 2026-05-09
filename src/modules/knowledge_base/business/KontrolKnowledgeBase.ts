import type { Request, Response } from "express";

import fs from "node:fs/promises";
import { v4 as uuidv4 } from "uuid";

import type { KnowledgeBase } from "../domain/KnowledgeBase.js";
import type { KnowledgeBaseResponseDto } from "./dto/KnowledgeBaseResponseDto.js";

import { RepositoriKnowledgeBase } from "../data/RepositoriKnowledgeBase.js";
import { StatusKnowledgeBase } from "../domain/StatusKnowledgeBase.js";
import { toResponseDto } from "./dto/converters.js";
import { validasiUploadDokumen } from "./dto/validators.js";

export class KontrolKnowledgeBase {
  private constructor() {}
  static readonly instance = new KontrolKnowledgeBase();

  private readonly repositori = RepositoriKnowledgeBase.instance;

  async getSemuaDokumen(req: Request, res: Response): Promise<void> {
    const dokumen = await this.repositori.getSemuaDokumen();
    const response: KnowledgeBaseResponseDto[] = dokumen.map(toResponseDto);
    res.status(200).json(response);
  }

  async uploadDokumen(req: Request, res: Response): Promise<void> {
    const dto = validasiUploadDokumen(req);

    const knowledgeBase: KnowledgeBase = {
      id: 0n,
      docId: uuidv4().toString(),
      judul: dto.judul,
      idKategori: dto.idKategori,
      namaBerkas: dto.file.originalname,
      path: dto.file.path,
      status: StatusKnowledgeBase.BelumDiproses,
    };

    const dokumen = await this.repositori.buatDokumen(knowledgeBase);

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
