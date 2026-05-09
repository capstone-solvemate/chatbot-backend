import type { Request, Response } from "express";

import fs from "node:fs/promises";
import { v4 as uuidv4 } from "uuid";

import type { KnowledgeBase } from "../domain/KnowledgeBase.js";

import { RepositoriKnowledgeBase } from "../data/RepositoriKnowledgeBase.js";
import { StatusKnowledgeBase } from "../domain/StatusKnowledgeBase.js";

export class KontrolKnowledgeBase {
  private constructor() {}
  static readonly instance = new KontrolKnowledgeBase();

  private readonly repositori = RepositoriKnowledgeBase.instance;

  async getSemuaDokumen(req: Request, res: Response): Promise<void> {
    try {
      const dokumen = await this.repositori.getSemuaDokumen();
      // Konversi BigInt ke string untuk JSON
      const jsonSafe = dokumen.map(doc => ({
        ...doc,
        id: doc.id.toString(),
      }));
      res.status(200).json(jsonSafe);
    }
    catch (error: any) {
      console.error("Gagal mengambil dokumen:", error);
      res.status(500).json({ error: "internal_error", message: "Gagal mengambil daftar dokumen" });
    }
  }

  async uploadDokumen(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: "bad_request", message: "Tidak ada file yang diunggah" });
        return;
      }

      const { judul, idKategori } = req.body;

      if (!judul || typeof judul !== "string" || judul.trim() === "") {
        res.status(400).json({ error: "bad_request", message: "Judul dokumen tidak boleh kosong" });
        return;
      }

      const idKategoriInt = Number.parseInt(idKategori);
      if (!idKategori || Number.isNaN(idKategoriInt)) {
        res.status(400).json({ error: "bad_request", message: "Kategori tidak valid" });
        return;
      }

      const file = req.file;
      const docId = uuidv4();

      const knowledgeBase: KnowledgeBase = {
        id: 0n,
        docId,
        judul: judul.trim(),
        idKategori: idKategoriInt,
        namaBerkas: file.originalname,
        path: file.path,
        status: StatusKnowledgeBase.BelumDiproses,
      };

      // Simpan ke database dengan status BelumDiproses
      const dokumen = await this.repositori.buatDokumen(knowledgeBase);

      // Konversi BigInt ke string
      const jsonSafe = { ...dokumen, id: dokumen.id.toString() };

      res.status(201).json({
        message: "File berhasil diunggah dan masuk antrian pemrosesan",
        dokumen: jsonSafe,
      });
    }
    catch (error: any) {
      console.error("Gagal mengunggah dokumen:", error);
      res.status(500).json({ error: "internal_error", message: "Gagal menyimpan dokumen" });
    }
  }

  async hapusDokumen(req: Request, res: Response): Promise<void> {
    try {
      const id = BigInt(req.params.id);
      const dokumen = await this.repositori.getDokumenById(id);

      if (!dokumen) {
        res.status(404).json({ error: "not_found", message: "Dokumen tidak ditemukan" });
        return;
      }

      // Hapus file fisik
      try {
        await fs.unlink(dokumen.path);
      }
      catch (fsError) {
        console.error("File fisik tidak ditemukan atau gagal dihapus:", fsError);
        // Kita tetap lanjutkan menghapus dari database
      }

      // Hapus dari database
      await this.repositori.hapusDokumen(id);

      res.status(200).json({ message: "Dokumen berhasil dihapus" });
    }
    catch (error: any) {
      console.error("Gagal menghapus dokumen:", error);
      res.status(500).json({ error: "internal_error", message: "Terjadi kesalahan saat menghapus dokumen" });
    }
  }
}
