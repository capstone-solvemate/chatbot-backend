import type { Request, Response } from "express";

import express from "express";

import { auth } from "../middlewares.js";
import { KontrolOtentikasi } from "../modules/otentikasi/business/KontrolOtentikasi.js";
import { PeranPengguna } from "../modules/otentikasi/domain/PeranPengguna.js";

export const routerOtentikasi = express.Router();

const kontrolOtentikasi = KontrolOtentikasi.instance;
routerOtentikasi.post("/login/employee", (req, res) => kontrolOtentikasi.loginKaryawan(req, res));
/**
 * @swagger
 * /api/auth/login/admin:
 *   post:
 *     summary: Login as Admin
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@admin.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       204:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       419:
 *         description: CSRF token missing or invalid
 */
routerOtentikasi.post("/login/admin", (req, res) => kontrolOtentikasi.loginAdmin(req, res));

routerOtentikasi.post("/logout", auth([PeranPengguna.Admin, PeranPengguna.Karyawan]), (req, res) => kontrolOtentikasi.logout(req, res));
routerOtentikasi.get("/me", auth([PeranPengguna.Admin, PeranPengguna.Karyawan]), (req: Request, res: Response) => kontrolOtentikasi.getInfoPengguna(req, res));
