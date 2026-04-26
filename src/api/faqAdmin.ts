import * as express from "express";

import { KontrolFaq } from "~/modules/faq/business/KontrolFaq";

const kontrolFaq = KontrolFaq.instance;

export const routerFaqAdmin = express.Router();
routerFaqAdmin.get("/", (req, res) => kontrolFaq.getFaqs(req, res));
