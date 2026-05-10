import * as express from "express";

import { DI } from "~/di/DI";
import { auth } from "~/middlewares";
import { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna";

const kontrolFaq = DI.provideKontrolFaq();

export const routerFaq = express.Router();
routerFaq.get("/", auth([PeranPengguna.Karyawan]), (req, res) => kontrolFaq.getFaqs(req, res));
