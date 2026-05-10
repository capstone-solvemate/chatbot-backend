import * as express from "express";

import { DI } from "~/di/DI";
import { auth } from "~/middlewares";
import { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna";

const kontrolKategori = DI.provideKontrolKategori();

export const routerKategori = express.Router();
routerKategori.get("/", auth([PeranPengguna.Karyawan]), (req, res) => kontrolKategori.getDaftarKategori(req, res));
