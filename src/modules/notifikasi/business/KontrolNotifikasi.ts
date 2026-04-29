import type { Request, Response } from "express";

import type { GetNotifikasiResponseDto } from "./dto/GetNotifikasiResponseDto.js";

import { RepositoriNotifikasi } from "../data/RepositoriNotifikasi.js";
import { notifikasiToDto } from "./converters.js";

export class KontrolNotifikasi {
  static readonly instance = new KontrolNotifikasi();
  private constructor() {}

  private readonly repositoriNotifikasi = RepositoriNotifikasi.instance;

  async getDaftarNotifikasi(req: Request, res: Response) {
    const jumlahBelumDibaca = await this.repositoriNotifikasi.getJumlahNotifikasiBelumDibaca(
      req.sesiPengguna!.idPengguna!,
    );
    const daftarNotifikasi = await this.repositoriNotifikasi.getDaftarNotifikasi(
      req.sesiPengguna!.idPengguna!,
    );

    const resData: GetNotifikasiResponseDto = {
      jumlahBelumDibaca,
      notifikasi: daftarNotifikasi.map(notifikasi => notifikasiToDto(notifikasi)),
    };
    res.status(200);
    res.send(resData);
  }
}
