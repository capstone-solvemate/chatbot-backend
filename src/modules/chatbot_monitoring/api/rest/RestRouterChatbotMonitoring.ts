import express from "express";

import { DI } from "~/di/DI";
import { auth } from "~/middlewares";
import { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna.js";

import { validasiKirimReport } from "./dto/ValidatorKirimReport.js";

const kontrolChatbotMonitoring = DI.provideKontrolChatbotMonitoring();

export const routerRestChatbotMonitoring = express.Router();
routerRestChatbotMonitoring.post("/share", auth([PeranPengguna.Admin]), (req, res, next) => {
  try {
    const dto = validasiKirimReport(req.body);
    kontrolChatbotMonitoring.kirimReport(
      req.sesiPengguna!.idPengguna!,
      dto.emailTujuan,
      {
        tahun: dto.tahun,
        bulan: dto.bulan,
      },
      dto.zonaWaktu,
    )
      .then(() => {
        res.sendStatus(204);
      })
      .catch(next);
  }
  catch (e) {
    next(e);
  }
});
