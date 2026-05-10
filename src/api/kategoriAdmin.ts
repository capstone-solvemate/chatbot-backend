import * as express from "express";

import { DI } from "~/di/DI";
import { auth } from "~/middlewares";
import { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna";

const kontrolKategori = DI.provideKontrolKategori();

export const routerKategoriAdmin = express.Router();
routerKategoriAdmin.get("/", auth([PeranPengguna.Admin]), (req, res) => kontrolKategori.getDaftarKategori(req, res));

routerKategoriAdmin.post("/", auth([PeranPengguna.Admin]), (req, res, next) => {
  kontrolKategori.tambahKategori(req, res).catch(next);
});

routerKategoriAdmin.put("/:id", auth([PeranPengguna.Admin]), (req, res, next) => {
  kontrolKategori.editKategori(req, res).catch(next);
});

routerKategoriAdmin.delete("/:id", auth([PeranPengguna.Admin]), (req, res, next) => {
  kontrolKategori.hapusKategori(req, res).catch(next);
});
