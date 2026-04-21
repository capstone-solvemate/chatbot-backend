import type { Request, Response } from "express";

import express from "express";

import { auth } from "../middlewares.js";
import { KontrolOtentikasi } from "../modules/otentikasi/business/KontrolOtentikasi.js";
import { PeranPengguna } from "../modules/otentikasi/domain/PeranPengguna.js";

export const routerOtentikasi = express.Router();

const kontrolOtentikasi = KontrolOtentikasi.instance;
routerOtentikasi.post("/login/employee", (req, res) => kontrolOtentikasi.loginKaryawan(req, res));

routerOtentikasi.get("/me", auth([PeranPengguna.Admin, PeranPengguna.Karyawan]), (req: Request, res: Response) => kontrolOtentikasi.getInfoPengguna(req, res));
