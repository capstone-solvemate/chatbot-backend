import * as express from "express";

import { DI } from "~/di/DI";
import { auth } from "~/middlewares";
import { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna";

const kontrolFaq = DI.provideKontrolFaq();

export const routerFaqAdmin = express.Router();
routerFaqAdmin.get("/", auth([PeranPengguna.Admin]), (req, res) => kontrolFaq.getFaqs(req, res));
routerFaqAdmin.post("/", auth([PeranPengguna.Admin]), (req, res) => kontrolFaq.createFaq(req, res));
routerFaqAdmin.put("/:id", auth([PeranPengguna.Admin]), (req, res) => kontrolFaq.updateFaq(req, res));
routerFaqAdmin.delete("/:id", auth([PeranPengguna.Admin]), (req, res) => kontrolFaq.deleteFaq(req, res));
