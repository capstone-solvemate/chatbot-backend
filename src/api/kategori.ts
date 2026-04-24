import * as express from "express";

import { auth } from "~/middlewares";
import { PeranPengguna } from "~/modules/otentikasi/domain/PeranPengguna";
import { KontrolKategori } from "~/modules/settings/kategori/business/KontrolKategori";

const kontrolKategori = KontrolKategori.instance;

export const routerKategori = express.Router();
routerKategori.get("/", auth([PeranPengguna.Karyawan]), (req, res) => kontrolKategori.getDaftarKategori(req, res));
