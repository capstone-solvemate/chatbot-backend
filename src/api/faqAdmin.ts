import * as express from "express";

import { auth } from "~/middlewares";
import { KontrolFaq } from "~/modules/faq/business/KontrolFaq";
import { PeranPengguna } from "~/modules/otentikasi/domain/PeranPengguna";

const kontrolFaq = KontrolFaq.instance;

export const routerFaqAdmin = express.Router();
routerFaqAdmin.get("/", auth([PeranPengguna.Admin]), (req, res) => kontrolFaq.getFaqs(req, res));
