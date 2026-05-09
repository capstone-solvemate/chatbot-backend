import * as express from "express";

import { auth } from "~/middlewares";
import { KontrolFaq } from "~/modules/faq/business/KontrolFaq";
import { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna";

const kontrolFaq = KontrolFaq.instance;

export const routerFaqAdmin = express.Router();
routerFaqAdmin.get("/", auth([PeranPengguna.Admin]), (req, res) => kontrolFaq.getFaqs(req, res));
routerFaqAdmin.post("/", auth([PeranPengguna.Admin]), (req, res) => kontrolFaq.createFaq(req, res));
routerFaqAdmin.put("/:id", auth([PeranPengguna.Admin]), (req, res) => kontrolFaq.updateFaq(req, res));
routerFaqAdmin.delete("/:id", auth([PeranPengguna.Admin]), (req, res) => kontrolFaq.deleteFaq(req, res));
