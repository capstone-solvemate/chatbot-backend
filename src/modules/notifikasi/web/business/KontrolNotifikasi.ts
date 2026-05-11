import type { Request, Response } from "express";
import type WebSocket from "ws";

import type { EmailWorkerClient } from "~/modules/notifikasi/email/business/EmailWorkerClient.js";
import type { RepositoriPengguna } from "~/modules/pengguna/data/RepositoriPengguna.js";
import type { EventPesanTiketBaruPayload } from "~/modules/tiket/event/payload/EventPesanTiketBaruPayload.js";
import type { EventStatusTiketDiubahPayload } from "~/modules/tiket/event/payload/EventStatusTiketDiubahPayload.js";
import type { EventTiketDibuatPayload } from "~/modules/tiket/event/payload/EventTiketDibuatPayload.js";

import { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna.js";

import type { RepositoriNotifikasi } from "../data/RepositoriNotifikasi.js";
import type { GetNotifikasiResponseDto } from "./dto/GetNotifikasiResponseDto.js";
import type { KoneksiNotifikasi } from "./KoneksiNotifikasi.js";
import type { NotifikasiWsManager } from "./NotifikasiWsManager.js";

import { NotifikasiTiket } from "../domain/NotifikasiTiket.js";
import { notifikasiToDto } from "./converters.js";

export class KontrolNotifikasi {
  constructor(
    private readonly repositoriNotifikasi: RepositoriNotifikasi,
    private readonly repositoriPengguna: RepositoriPengguna,
    private readonly emailWorkerClient: EmailWorkerClient,
    private readonly notifikasiWsManager: NotifikasiWsManager,
  ) {}

  // ─── HTTP Handlers ────────────────────────────────────────────────────────

  async getDaftarNotifikasi(req: Request, res: Response): Promise<void> {
    const idPengguna = req.sesiPengguna!.idPengguna!;

    const sebelumId = req.query.sebelum !== undefined
      ? BigInt(req.query.sebelum as string)
      : undefined;

    const [jumlahBelumDibaca, { notifikasi, adaLebihBanyak }] = await Promise.all([
      this.repositoriNotifikasi.getJumlahNotifikasiBelumDibaca(idPengguna),
      this.repositoriNotifikasi.getDaftarNotifikasi(idPengguna, sebelumId),
    ]);

    const resData: GetNotifikasiResponseDto = {
      jumlahBelumDibaca,
      notifikasi: notifikasi.map(notifikasiToDto),
      adaLebihBanyak,
    };
    res.status(200).json(resData);
  }

  async tandaiDibaca(req: Request, res: Response): Promise<void> {
    const id = BigInt(req.params.id);
    const idPengguna = req.sesiPengguna!.idPengguna!;
    await this.repositoriNotifikasi.tandaiDibaca(id, idPengguna);
    res.sendStatus(204);
  }

  async tandaiSemuaDibaca(req: Request, res: Response): Promise<void> {
    const idPengguna = req.sesiPengguna!.idPengguna!;
    await this.repositoriNotifikasi.tandaiSemuaDibaca(idPengguna);
    res.sendStatus(204);
  }

  // ─── WS Handler ───────────────────────────────────────────────────────────

  handleWsConnect(ws: WebSocket, idPengguna: number, idSession: string): void {
    const koneksi: KoneksiNotifikasi = { ws, idPengguna, idSession };
    this.notifikasiWsManager.tambah(koneksi);

    ws.on("close", () => {
      this.notifikasiWsManager.hapus(koneksi);
    });
  }

  // ─── Event Handlers ───────────────────────────────────────────────────────

  async tanganiTiketDibuat(payload: EventTiketDibuatPayload): Promise<void> {
    const [pembuat, daftarAdmin] = await Promise.all([
      this.repositoriPengguna.getPenggunaById(payload.idPengguna),
      this.repositoriPengguna.getPenggunaAktifByPeran(PeranPengguna.Admin),
    ]);

    const namaPembuat = pembuat?.nama ?? "Karyawan";
    const judul = "Tiket baru masuk";
    const deskripsi = `${namaPembuat} membuat tiket baru: "${payload.judul}".`;

    await Promise.all(
      daftarAdmin.map(admin => this.simpanDanKirim(
        new NotifikasiTiket(0n, admin.id, judul, deskripsi, new Date(), null, payload.idTiket),
      )),
    );
    this.kirimEmailKeSemuaPenerima(daftarAdmin.map(a => a.email), judul, deskripsi);
  }

  async tanganiStatusDiubah(payload: EventStatusTiketDiubahPayload): Promise<void> {
    const pengirim = await this.repositoriPengguna.getPenggunaById(payload.idPengirim);
    const namaPengirim = pengirim?.nama ?? "Seseorang";

    const judul = "Status tiket diperbarui";
    const deskripsi = `${namaPengirim} mengubah status tiket "${payload.judulTiket}" menjadi ${payload.statusBaru}.`;

    if (payload.peranPengirim === PeranPengguna.Karyawan) {
      const daftarAdmin = await this.repositoriPengguna.getPenggunaAktifByPeran(PeranPengguna.Admin);
      await Promise.all(
        daftarAdmin.map(admin => this.simpanDanKirim(
          new NotifikasiTiket(0n, admin.id, judul, deskripsi, new Date(), null, payload.idTiket),
        )),
      );
      this.kirimEmailKeSemuaPenerima(daftarAdmin.map(a => a.email), judul, deskripsi);
    }
    else {
      const karyawan = await this.repositoriPengguna.getPenggunaById(payload.idPemilikTiket);
      if (karyawan) {
        await this.simpanDanKirim(
          new NotifikasiTiket(0n, karyawan.id, judul, deskripsi, new Date(), null, payload.idTiket),
        );
        this.kirimEmailKeSemuaPenerima([karyawan.email], judul, deskripsi);
      }
    }
  }

  async tanganiPesanBaru(payload: EventPesanTiketBaruPayload): Promise<void> {
    const pengirim = await this.repositoriPengguna.getPenggunaById(payload.idPengirim);
    const namaPengirim = pengirim?.nama ?? "Seseorang";

    const judul = "Pesan baru di tiket";
    const deskripsi = `${namaPengirim} membalas tiket "${payload.judulTiket}".`;

    if (payload.peranPengirim === PeranPengguna.Karyawan) {
      const daftarAdmin = await this.repositoriPengguna.getPenggunaAktifByPeran(PeranPengguna.Admin);
      await Promise.all(
        daftarAdmin.map(admin => this.simpanDanKirim(
          new NotifikasiTiket(0n, admin.id, judul, deskripsi, new Date(), null, payload.idTiket),
        )),
      );
      this.kirimEmailKeSemuaPenerima(daftarAdmin.map(a => a.email), judul, deskripsi);
    }
    else {
      const karyawan = await this.repositoriPengguna.getPenggunaById(payload.idPemilikTiket);
      if (karyawan) {
        await this.simpanDanKirim(
          new NotifikasiTiket(0n, karyawan.id, judul, deskripsi, new Date(), null, payload.idTiket),
        );
        this.kirimEmailKeSemuaPenerima([karyawan.email], judul, deskripsi);
      }
    }
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  private async simpanDanKirim(notifikasi: NotifikasiTiket): Promise<void> {
    await this.repositoriNotifikasi.buatNotifikasi(notifikasi);
    this.notifikasiWsManager.kirim(notifikasi.idPengguna, notifikasiToDto(notifikasi));
  }

  private kirimEmailKeSemuaPenerima(
    emailPenerima: string[],
    judul: string,
    deskripsi: string,
  ): void {
    for (const email of emailPenerima) {
      this.emailWorkerClient.kirim({
        to: email,
        subject: judul,
        html: `<p>${deskripsi}</p>`,
      });
    }
  }
}
