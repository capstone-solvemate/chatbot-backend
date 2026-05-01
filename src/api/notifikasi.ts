import * as express from "express";

import { auth } from "~/middlewares";
import { KontrolNotifikasi } from "~/modules/notifikasi/business/KontrolNotifikasi";
import { PeranPengguna } from "~/modules/otentikasi/domain/PeranPengguna";

const kontrolNotifikasi = KontrolNotifikasi.instance;

export const routerNotifikasi = express.Router();
routerNotifikasi.get("/", auth([PeranPengguna.Admin, PeranPengguna.Karyawan]), (req, res) => kontrolNotifikasi.getDaftarNotifikasi(req, res));
