import { Router } from "express";

import { DI } from "~/di/DI";
import { auth } from "~/middlewares";
import { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna";

const kontrolPengguna = DI.provideKontrolPengguna();

export const routerPenggunaAdmin = Router();
routerPenggunaAdmin.post("/", auth([PeranPengguna.Admin]), (req, res, next) => kontrolPengguna.tambahPengguna(req, res).catch(next));
routerPenggunaAdmin.get("/", auth([PeranPengguna.Admin]), (req, res, next) => kontrolPengguna.getPengguna(req, res).catch(next));
