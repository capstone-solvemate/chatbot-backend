import express from "express";

import { KontrolOtentikasi } from "../modules/otentikasi/business/KontrolOtentikasi.js";

export const routerOtentikasi = express.Router();

const kontrolOtentikasi = KontrolOtentikasi.instance;
routerOtentikasi.post("/login/employee", (req, res) => kontrolOtentikasi.loginKaryawan(req, res));
