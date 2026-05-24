import { Router } from "express";

import { DI } from "~/di/DI.js";

import { multerUpload } from "../config/multerConfig.js";
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

routerTiket.get(
  "/ringkasan-status",
  auth([PeranPengguna.Karyawan]),
  (req, res, next) => {
    kontrol.getRingkasanStatusTiket(req, res).catch(next);
  },
);

routerTiket.get("/:idChat", auth(semuaPeran), (req, res, next) => {
  kontrol.getTiketById(req, res).catch(next);
});

routerTiket.patch("/:idChat/status", auth(semuaPeran), (req, res, next) => {
  kontrol.updateStatusTiket(req, res).catch(next);
});

routerTiket.post("/:idChat/pesan", auth(semuaPeran), multerUpload.array("files", 5), (req, res, next) => {
  kontrol.buatPesanTiket(req, res).catch(next);
});

routerTiket.get("/:idChat/admin", auth([PeranPengguna.Admin]), (req, res, next) => {
  kontrol.getTiketByIdAdmin(req, res).catch(next);
});
