import type { Request, Response } from "express";

import { ForbiddenError } from "~/core/types/ForbiddenError.js";
import { DI } from "~/di/DI.js";
import { DashboardEventBus } from "~/modules/dashboard/business/DashboardEventBus.js";

import type { RepositoriTiket, TiketDenganPembuat } from "../data/RepositoriTiket.js";
import type {
  PesanChatResponseDto,
  PesanTiketResponseDto,
  TiketAdminDetailResponseDto,
  TiketDetailResponseDto,
  TiketResponseDto,
} from "./dto/TiketResponseDto.js";

import { PeranPengguna } from "../../pengguna/domain/PeranPengguna.js";
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
  ) {}

  private readonly repositoriChat = DI.provideRepositoriChat();

  async buatTiket(req: Request, res: Response): Promise<void> {
    const dto = validasiBuatTiket(req);
    const sesi = req.sesiPengguna!;

    // Validasi chat: harus ada dan milik pengguna yang sedang login
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

    DashboardEventBus.tiketDibuat();

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
    const id = BigInt(req.params.id);
    const sesi = req.sesiPengguna!;

    const result = await this.repositoriTiket.getById(id);
    if (!result) {
      res.status(404).json({ success: false, message: "Tiket tidak ditemukan." });
      return;
    }

    const isAdmin = sesi.peranPengguna === PeranPengguna.Admin;
    if (!isAdmin && result.tiket.idPembuat !== sesi.idPengguna) {
      throw new ForbiddenError();
    }

    const pesans = await this.repositoriTiket.getPesanByTiket(id);
    const data: TiketDetailResponseDto = {
      ...tiketToDto(result),
      pesanTiket: pesans.map(pesanTiketToDto),
    };

    res.json({ success: true, data });
  }

  async getTiketByIdAdmin(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);

    const [result, pesans] = await Promise.all([
      this.repositoriTiket.getByIdLengkap(id),
      this.repositoriTiket.getPesanByTiket(id),
    ]);

    if (!result) {
      res.status(404).json({ success: false, message: "Tiket tidak ditemukan." });
      return;
    }

    const historiChat = await this.repositoriChat.getHistoriPesan(result.tiket.idChat);

    const data: TiketAdminDetailResponseDto = {
      ...tiketToDto(result),
      emailPembuat: result.emailPembuat,
      pesanTiket: pesans.map(pesanTiketToDto),
      historiChat: historiChat.map((p): PesanChatResponseDto => ({
        id: p.id.toString(),
        idChat: p.idChat.toString(),
        pesan: p.pesan,
        dibuatPada: p.tanggalDibuat.toISOString(),
        dariAsisten: p.chatAsisten,
      })),
    };

    res.json({ success: true, data });
  }

  async updateStatusTiket(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    const sesi = req.sesiPengguna!;
    const dto = validasiUpdateStatusTiket(req);
    const isAdmin = sesi.peranPengguna === PeranPengguna.Admin;

    const result = await this.repositoriTiket.getById(id);
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

    await this.repositoriTiket.updateStatus(id, dto.status);
    res.json({ success: true });
  }

  async buatPesanTiket(req: Request, res: Response): Promise<void> {
    const idTiket = BigInt(req.params.id);
    const sesi = req.sesiPengguna!;
    const dto = validasiBuatPesanTiket(req);

    const result = await this.repositoriTiket.getById(idTiket);
    if (!result) {
      res.status(404).json({ success: false, message: "Tiket tidak ditemukan." });
      return;
    }

    const isAdmin = sesi.peranPengguna === PeranPengguna.Admin;
    if (!isAdmin && result.tiket.idPembuat !== sesi.idPengguna) {
      throw new ForbiddenError();
    }

    const pesan = await this.repositoriTiket.buatPesanTiket(
      new PesanTiket(0n, idTiket, sesi.idPengguna!, dto.pesan, new Date()),
    );

    res.status(201).json({ success: true, data: pesanTiketToDto(pesan) });
  }
}
