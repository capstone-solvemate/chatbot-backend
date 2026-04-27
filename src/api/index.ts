import express from "express";

import type MessageResponse from "../interfaces/message-response.js";

import emojis from "./emojis.js";
import { routerKategori } from "./kategori.js";
import { routerKategoriAdmin } from "./kategoriAdmin.js";
import { routerOtentikasi } from "./otentikasi.js";
import routerChat from "./chat.js";

const router = express.Router();

/**
 * @swagger
 * /api/:
 *   get:
 *     summary: API Root - Used to obtain Session and CSRF Cookies
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Success
 *       419:
 *         description: Expected error when first obtaining the session
 */
router.get<object, MessageResponse>("/", (req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  });
});

router.use("/emojis", emojis);
router.use("/auth", routerOtentikasi);
router.use("/categories", routerKategori);

router.use("/admin/categories", routerKategoriAdmin);
router.use("/chat", routerChat);

export default router;
