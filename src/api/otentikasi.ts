import type { Request, Response } from "express";

import express from "express";

import { auth } from "../middlewares.js";
import { KontrolOtentikasi } from "../modules/otentikasi/business/KontrolOtentikasi.js";
import { PeranPengguna } from "../modules/otentikasi/domain/PeranPengguna.js";

export const routerOtentikasi = express.Router();

const kontrolOtentikasi = KontrolOtentikasi.instance;
routerOtentikasi.post("/login/employee", (req, res) => kontrolOtentikasi.loginKaryawan(req, res));
routerOtentikasi.post("/login/admin", (req, res) => kontrolOtentikasi.loginAdmin(req, res));

routerOtentikasi.post("/logout", auth([PeranPengguna.Admin, PeranPengguna.Karyawan]), (req, res) => kontrolOtentikasi.logout(req, res));
routerOtentikasi.get("/me", auth([PeranPengguna.Admin, PeranPengguna.Karyawan]), (req: Request, res: Response) => kontrolOtentikasi.getInfoPengguna(req, res));

routerOtentikasi.post("/forget-password/ask-otp", (req, res, next) => {
  kontrolOtentikasi.mintaOtp(req, res).catch(next);
});
routerOtentikasi.post("/forget-password/verify-otp", (req, res, next) => {
  kontrolOtentikasi.verifikasiOtp(req, res).catch(next);
});
routerOtentikasi.post("/forget-password/save-password", (req, res, next) => {
  kontrolOtentikasi.simpanPassword(req, res).catch(next);
});
