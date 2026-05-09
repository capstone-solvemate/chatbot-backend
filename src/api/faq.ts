import * as express from "express";

import { auth } from "~/middlewares";
import { KontrolFaq } from "~/modules/faq/business/KontrolFaq";
import { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna";

const kontrolFaq = KontrolFaq.instance;

export const routerFaq = express.Router();
routerFaq.get("/", auth([PeranPengguna.Karyawan]), (req, res) => kontrolFaq.getFaqs(req, res));
