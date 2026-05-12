import type { Request, Response } from "express";

import fs from "node:fs";

import type { RepositoriLampiran } from "../data/RepositoriLampiran.js";
import type { JenisPesan } from "../domain/Lampiran.js";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];
const ALLOWED_KONTEKS: JenisPesan[] = ["chat", "tiket"];

export class KontrolUpload {
  constructor(
    private readonly repositoriLampiran: RepositoriLampiran,
  ) {}

  async uploadGambar(req: Request, res: Response): Promise<void> {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "bad_request", message: "Tidak ada file yang diunggah." });
      return;
    }

    // Validasi MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      // Hapus file yang sudah disimpan oleh multer
      fs.unlink(file.path, () => {});
      res.status(400).json({
        error: "bad_request",
        message: "Format file tidak didukung. Hanya JPEG dan PNG yang diizinkan.",
      });
      return;
    }

    // Validasi konteks
    const konteks = req.query.konteks as string | undefined;
    if (!konteks || !ALLOWED_KONTEKS.includes(konteks as JenisPesan)) {
      fs.unlink(file.path, () => {});
      res.status(400).json({
        error: "bad_request",
        message: "Parameter 'konteks' wajib diisi dengan nilai 'chat' atau 'tiket'.",
      });
      return;
    }

    const idPengunggah = req.sesiPengguna!.idPengguna!;

    const lampiran = await this.repositoriLampiran.simpan({
      jenisPesan: konteks as JenisPesan,
      idPesan: null,
      idPengunggah,
      namaAsli: file.originalname,
      namaBerkas: file.filename,
      path: file.path.replace(/\\/g, "/"),
      ukuran: file.size,
      mimeType: file.mimetype,
      dibuatPada: new Date(),
    });

    res.status(201).json({
      success: true,
      data: {
        id: lampiran.id.toString(),
        url: lampiran.url,
        namaAsli: lampiran.namaAsli,
        ukuran: lampiran.ukuran,
        mimeType: lampiran.mimeType,
      },
    });
  }

  async hapusGambar(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    const idPengguna = req.sesiPengguna!.idPengguna!;

    const lampiran = await this.repositoriLampiran.getById(id);
    if (!lampiran) {
      res.status(404).json({ error: "not_found", message: "Lampiran tidak ditemukan." });
      return;
    }

    // Hanya pemilik yang boleh menghapus
    if (lampiran.idPengunggah !== idPengguna) {
      res.status(403).json({ error: "forbidden", message: "Anda tidak memiliki akses untuk menghapus lampiran ini." });
      return;
    }

    // Hapus file dari disk
    try {
      fs.unlinkSync(lampiran.path);
    }
    catch {
      // File mungkin sudah tidak ada, lanjut saja
    }

    await this.repositoriLampiran.hapus(id);

    res.json({ success: true, message: "Lampiran berhasil dihapus." });
  }
}
