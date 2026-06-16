import type { Request, Response } from "express";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { DataNotFoundError } from "~/core/types/DataNotFoundError.js";
import { ForbiddenError } from "~/core/types/ForbiddenError.js";
import { DI } from "~/di/DI.js";

import type { RepositoriLampiran } from "../../upload/data/RepositoriLampiran.js";
import type { RepositoriTiket, TiketDenganPembuat } from "../data/RepositoriTiket.js";
import type { TiketEventBus } from "../event/TiketEventBus.js";
import type {
  PesanChatResponseDto,
  PesanTiketResponseDto,
  TiketAdminDetailResponseDto,
  TiketDetailResponseDto,
  TiketResponseDto,
} from "./dto/TiketResponseDto.js";

import { PeranPengguna } from "../../pengguna/domain/PeranPengguna.js";
import { LAMPIRAN_ENTITY_NAME, lampiranToDto } from "../../upload/domain/Lampiran.js";
import { PesanTiket } from "../domain/PesanTiket.js";
import { intToStatusTiket, StatusTiket, statusTiketToString } from "../domain/StatusTiket.js";
import { Tiket } from "../domain/Tiket.js";
import {
  validasiBuatPesanTiket,
  validasiBuatTiket,
  validasiUpdateStatusTiket,
} from "./dto/validators.js";

function tiketToDto({ tiket, namaPembuat }: TiketDenganPembuat): TiketResponseDto {
  return {
    id: tiket.id.toString(),
    judul: tiket.judul,
    deskripsi: tiket.deskripsi,
    idPembuat: tiket.idPembuat,
    namaPembuat,
    idChat: tiket.idChat.toString(),
    idKategori: tiket.idKategori,
    status: statusTiketToString(tiket.status),
    dibuatPada: tiket.dibuatPada.toISOString(),
    diperbaruiPada: tiket.diperbaruiPada.toISOString(),
    lampiran: [],
  };
}

function pesanTiketToDto(pesan: PesanTiket): PesanTiketResponseDto {
  return {
    id: pesan.id.toString(),
    idTiket: pesan.idTiket.toString(),
    idPembuat: pesan.idPembuat,
    pesan: pesan.pesan,
    dibuatPada: pesan.dibuatPada.toISOString(),
  };
}

export class KontrolTiket {
  constructor(
    private readonly repositoriTiket: RepositoriTiket,
    private readonly tiketEventBus: TiketEventBus,
    private readonly repositoriLampiran: RepositoriLampiran,
  ) {}

  private readonly repositoriChat = DI.provideRepositoriChat();

  async buatTiket(req: Request, res: Response): Promise<void> {
    const dto = validasiBuatTiket(req);
    const sesi = req.sesiPengguna!;

    const chat = await this.repositoriChat.getChatById(dto.idChat);
    if (!chat) {
      res.status(404).json({ success: false, message: "Chat tidak ditemukan." });
      return;
    }
    if (chat.idPembuat !== sesi.idPengguna) {
      throw new ForbiddenError();
    }

    const tiket = await this.repositoriTiket.buatTiket(
      new Tiket(
        0n,
        dto.judul,
        dto.deskripsi,
        sesi.idPengguna!,
        dto.idChat,
        dto.idKategori,
        StatusTiket.Open,
        new Date(),
        new Date(),
      ),
    );

    // Simpan lampiran langsung dari form-data (jika ada)
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length > 0) {
      await Promise.all(
        files.map(file =>
          this.repositoriLampiran.simpan({
            jenisPesan: "tiket" as const,
            idPesan: tiket.id,
            idPengunggah: sesi.idPengguna!,
            namaAsli: file.originalname,
            namaBerkas: file.filename,
            path: file.path.replace(/\\/g, "/"),
            ukuran: file.size,
            mimeType: file.mimetype,
            dibuatPada: new Date(),
          }),
        ),
      );
    }

    this.tiketEventBus.emit("tiket_dibuat", {
      idTiket: tiket.idChat,
      idPengguna: sesi.idPengguna!,
      judul: tiket.judul,
      nomorTiket: tiket.id,
    });

    res.status(201).json({ success: true, data: tiketToDto({ tiket, namaPembuat: "" }) });
  }

  async getDaftarTiket(req: Request, res: Response): Promise<void> {
    const sesi = req.sesiPengguna!;
    const isAdmin = sesi.peranPengguna === PeranPengguna.Admin;

    if (!isAdmin) {
      const tikets = await this.repositoriTiket.getByPembuat(sesi.idPengguna!);
      res.json({ success: true, data: tikets.map(tiketToDto) });
      return;
    }

    const { status, idKategori, kata } = req.query;

    const filter = {
      status: status !== undefined ? intToStatusTiket(Number(status)) ?? undefined : undefined,
      idKategori: idKategori !== undefined ? Number(idKategori) || undefined : undefined,
      kata: typeof kata === "string" ? kata : undefined,
    };

    const tikets = await this.repositoriTiket.getAll(filter);
    res.json({ success: true, data: tikets.map(tiketToDto) });
  }

  async getTiketById(req: Request, res: Response): Promise<void> {
    const idChat = BigInt(req.params.idChat);
    const sesi = req.sesiPengguna!;

    const result = await this.repositoriTiket.getByIdChat(idChat);
    if (!result) {
      res.status(404).json({ success: false, message: "Tiket tidak ditemukan." });
      return;
    }

    const isAdmin = sesi.peranPengguna === PeranPengguna.Admin;
    if (!isAdmin && result.tiket.idPembuat !== sesi.idPengguna) {
      throw new ForbiddenError();
    }

    const pesans = await this.repositoriTiket.getPesanByTiket(idChat);
    const lampiranList = await this.repositoriLampiran.getByIdPesan("tiket", result.tiket.id);

    // Batch-fetch lampiran untuk semua pesan tiket
    const pesanIds = pesans.map(p => p.id);
    const lampiranPesanMap = pesanIds.length > 0
      ? await this.repositoriLampiran.getByIdPesanBatch("pesan_tiket", pesanIds)
      : new Map();

    const data: TiketDetailResponseDto = {
      ...tiketToDto(result),
      lampiran: lampiranList.map(lampiranToDto),
      pesanTiket: pesans.map(p => ({
        ...pesanTiketToDto(p),
        lampiran: (lampiranPesanMap.get(p.id.toString()) ?? []).map(lampiranToDto),
      })),
    };

    res.json({ success: true, data });
  }

  async getLampiranTiket(req: Request, res: Response): Promise<void> {
    const idChat = BigInt(req.params.idChat);
    const sesi = req.sesiPengguna!;

    const result = await this.repositoriTiket.getByIdChat(idChat);
    if (!result) {
      res.status(404).json({ success: false, message: "Tiket tidak ditemukan." });
      return;
    }

    const isAdmin = sesi.peranPengguna === PeranPengguna.Admin;
    if (!isAdmin && result.tiket.idPembuat !== sesi.idPengguna) {
      throw new ForbiddenError();
    }

    const idLampiran = BigInt(req.params.idLampiran);
    const lampiran = await this.repositoriLampiran.getById(idLampiran);
    if (!lampiran) {
      throw new DataNotFoundError(LAMPIRAN_ENTITY_NAME);
    }
    if (lampiran.idPesan !== result.tiket.id) {
      throw new ForbiddenError();
    }

    const fullPath = path.resolve(process.cwd(), lampiran.path);
    const data = await readFile(fullPath);

    res.setHeader("Content-Type", lampiran.mimeType);
    res.send(data);
  }

  async getLampiranPesanTiket(req: Request, res: Response): Promise<void> {
    const idChat = BigInt(req.params.idChat);
    const idPesan = BigInt(req.params.idPesan);
    const sesi = req.sesiPengguna!;

    const result = await this.repositoriTiket.getByIdChat(idChat);
    if (!result) {
      res.status(404).json({ success: false, message: "Tiket tidak ditemukan." });
      return;
    }

    const isAdmin = sesi.peranPengguna === PeranPengguna.Admin;
    if (!isAdmin && result.tiket.idPembuat !== sesi.idPengguna) {
      throw new ForbiddenError();
    }

    const pesanExists = await this.repositoriTiket.isPesanTiketExists(result.tiket.id, idPesan);
    if (!pesanExists) {
      throw new ForbiddenError();
    }

    const idLampiran = BigInt(req.params.idLampiran);
    const lampiran = await this.repositoriLampiran.getById(idLampiran);
    if (!lampiran) {
      throw new DataNotFoundError(LAMPIRAN_ENTITY_NAME);
    }
    if (lampiran.idPesan !== idPesan) {
      throw new ForbiddenError();
    }

    const fullPath = path.resolve(process.cwd(), lampiran.path);
    const data = await readFile(fullPath);

    res.setHeader("Content-Type", lampiran.mimeType);
    res.send(data);
  }

  async getTiketByIdAdmin(req: Request, res: Response): Promise<void> {
    const idChat = BigInt(req.params.idChat);

    const [result, pesans] = await Promise.all([
      this.repositoriTiket.getByIdChatLengkap(idChat),
      this.repositoriTiket.getPesanByTiket(idChat),
    ]);

    if (!result) {
      res.status(404).json({ success: false, message: "Tiket tidak ditemukan." });
      return;
    }

    const historiChat = await this.repositoriChat.getHistoriPesan(result.tiket.idChat);

    // Batch-fetch lampiran untuk pesan tiket
    const pesanTiketIds = pesans.map(p => p.id);
    const lampiranMap = pesanTiketIds.length > 0
      ? await this.repositoriLampiran.getByIdPesanBatch("pesan_tiket", pesanTiketIds)
      : new Map();

    // Batch-fetch lampiran untuk pesan chat
    // const pesanChatIds = historiChat.map(p => p.id);
    // const lampiranChatMap = pesanChatIds.length > 0
    //   ? await this.repositoriLampiran.getByIdPesanBatch("chat", pesanChatIds)
    //   : new Map();

    const lampiranList = await this.repositoriLampiran.getByIdPesan("tiket", result.tiket.id);

    const data: TiketAdminDetailResponseDto = {
      ...tiketToDto(result),
      emailPembuat: result.emailPembuat,
      lampiran: lampiranList.map(lampiranToDto),
      pesanTiket: pesans.map(p => ({
        ...pesanTiketToDto(p),
        lampiran: (lampiranMap.get(p.id.toString()) ?? []).map(lampiranToDto),
      })),
      historiChat: historiChat.map((p): PesanChatResponseDto & { lampiran: any[] } => ({
        id: p.id.toString(),
        idChat: p.idChat.toString(),
        pesan: p.pesan,
        dibuatPada: p.tanggalDibuat.toISOString(),
        dariAsisten: p.chatAsisten,
        lampiran: [],
        // lampiran: (lampiranChatMap.get(p.id.toString()) ?? []).map(lampiranToDto),
      })),
    };

    res.json({ success: true, data });
  }

  async updateStatusTiket(req: Request, res: Response): Promise<void> {
    const idChat = BigInt(req.params.idChat);
    const sesi = req.sesiPengguna!;
    const dto = validasiUpdateStatusTiket(req);
    const isAdmin = sesi.peranPengguna === PeranPengguna.Admin;

    const result = await this.repositoriTiket.getByIdChat(idChat);
    if (!result) {
      res.status(404).json({ success: false, message: "Tiket tidak ditemukan." });
      return;
    }

    if (!isAdmin) {
      if (result.tiket.idPembuat !== sesi.idPengguna) {
        throw new ForbiddenError();
      }
      if (dto.status !== StatusTiket.Done) {
        throw new ForbiddenError();
      }
    }

    await this.repositoriTiket.updateStatus(idChat, dto.status);

    this.tiketEventBus.emit("status_diubah", {
      idTiket: result.tiket.idChat,
      judulTiket: result.tiket.judul,
      statusBaru: dto.status,
      idPengirim: sesi.idPengguna!,
      peranPengirim: sesi.peranPengguna!,
      idPemilikTiket: result.tiket.idPembuat,
      nomorTiket: result.tiket.id,
    });

    res.json({ success: true });
  }

  async buatPesanTiket(req: Request, res: Response): Promise<void> {
    const idChat = BigInt(req.params.idChat);
    const sesi = req.sesiPengguna!;
    const dto = validasiBuatPesanTiket(req);

    const result = await this.repositoriTiket.getByIdChat(idChat);
    if (!result) {
      res.status(404).json({ success: false, message: "Tiket tidak ditemukan." });
      return;
    }

    const isAdmin = sesi.peranPengguna === PeranPengguna.Admin;
    if (!isAdmin && result.tiket.idPembuat !== sesi.idPengguna) {
      throw new ForbiddenError();
    }

    const pesan = await this.repositoriTiket.buatPesanTiket(
      new PesanTiket(0n, result.tiket.id, sesi.idPengguna!, dto.pesan, new Date()),
    );

    // Simpan lampiran langsung dari form-data (jika ada)
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const lampiran = files.length > 0
      ? await Promise.all(
          files.map(file =>
            this.repositoriLampiran.simpan({
              jenisPesan: "pesan_tiket" as const,
              idPesan: pesan.id,
              idPengunggah: sesi.idPengguna!,
              namaAsli: file.originalname,
              namaBerkas: file.filename,
              path: file.path.replace(/\\/g, "/"),
              ukuran: file.size,
              mimeType: file.mimetype,
              dibuatPada: new Date(),
            }),
          ),
        )
      : [];

    this.tiketEventBus.emit("pesan_baru", {
      idTiket: result.tiket.idChat,
      judulTiket: result.tiket.judul,
      idPengirim: sesi.idPengguna!,
      peranPengirim: sesi.peranPengguna!,
      idPemilikTiket: result.tiket.idPembuat,
      nomorTiket: result.tiket.id,
      statusTerakhir: result.tiket.status,
    });

    res.status(201).json({
      success: true,
      data: {
        ...pesanTiketToDto(pesan),
        lampiran: lampiran.map(lampiranToDto),
      },
    });
  }

  async getRingkasanStatusTiket(req: Request, res: Response): Promise<void> {
    const sesi = req.sesiPengguna!;
    const ringkasan = await this.repositoriTiket.getRingkasanStatusByPembuat(sesi.idPengguna!);
    res.json({ success: true, data: ringkasan });
  }
}
