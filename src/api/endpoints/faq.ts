import * as express from "express";

import { DI } from "~/di/DI";
import { auth } from "~/middlewares";
import { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna";

const kontrolFaq = DI.provideKontrolFaq();

export const routerFaq = express.Router();
routerFaq.get("/", auth([PeranPengguna.Karyawan]), (req, res, next) => kontrolFaq.getFaqs(req, res).catch(next));

// ─── Popular FAQs ─────────────────────────────────────────────────────────────
// PENTING: harus di atas /:id agar "populer" tidak ditangkap sebagai param id

routerFaq.get("/populer", (req, res, next) => {
  kontrolFaq.getFaqPopuler(req, res).catch(next);
});

// ─── View Log ────────────────────────────────────────────────────────────────

routerFaq.post("/:id/lihat", auth([PeranPengguna.Karyawan]), (req, res, next) => {
  kontrolFaq.catatView(req, res).catch(next);
});

// ─── Survei ──────────────────────────────────────────────────────────────────

routerFaq.get("/:id/survei", auth([PeranPengguna.Karyawan]), (req, res, next) => {
  kontrolFaq.getSurveiku(req, res).catch(next);
});

routerFaq.post("/:id/survei", auth([PeranPengguna.Karyawan]), (req, res, next) => {
  kontrolFaq.submitSurvei(req, res).catch(next);
});
