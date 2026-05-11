import * as express from "express";

import { DI } from "~/di/DI";
import { auth } from "~/middlewares";
import { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna";

const kontrolNotifikasi = DI.provideKontrolNotifikasi();

export const routerNotifikasi = express.Router();
routerNotifikasi.get("/", auth([PeranPengguna.Admin, PeranPengguna.Karyawan]), (req, res) => kontrolNotifikasi.getDaftarNotifikasi(req, res));
