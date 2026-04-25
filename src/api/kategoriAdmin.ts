import * as express from "express";

import { auth } from "~/middlewares";
import { PeranPengguna } from "~/modules/otentikasi/domain/PeranPengguna";
import { KontrolKategori } from "~/modules/settings/kategori/business/KontrolKategori";

const kontrolKategori = KontrolKategori.instance;

export const routerKategoriAdmin = express.Router();
routerKategoriAdmin.get("/", auth([PeranPengguna.Admin]), (req, res) => kontrolKategori.getDaftarKategori(req, res));
