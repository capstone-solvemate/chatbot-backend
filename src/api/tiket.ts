import { Router } from "express";

import { DI } from "~/di/DI.js";

import { auth } from "../middlewares.js";
import { PeranPengguna } from "../modules/pengguna/domain/PeranPengguna.js";

export const routerTiket = Router();
const kontrol = DI.provideKontrolTiket();

const semuaPeran = [PeranPengguna.Karyawan, PeranPengguna.Admin];

routerTiket.post("/", auth([PeranPengguna.Karyawan]), (req, res, next) => {
  kontrol.buatTiket(req, res).catch(next);
});

routerTiket.get("/", auth(semuaPeran), (req, res, next) => {
  kontrol.getDaftarTiket(req, res).catch(next);
});

routerTiket.get("/:id", auth(semuaPeran), (req, res, next) => {
  kontrol.getTiketById(req, res).catch(next);
});

routerTiket.patch("/:id/status", auth(semuaPeran), (req, res, next) => {
  kontrol.updateStatusTiket(req, res).catch(next);
});

routerTiket.post("/:id/pesan", auth(semuaPeran), (req, res, next) => {
  kontrol.buatPesanTiket(req, res).catch(next);
});

routerTiket.get("/:id/admin", auth([PeranPengguna.Admin]), (req, res, next) => {
  kontrol.getTiketByIdAdmin(req, res).catch(next);
});
