import express from "express";

import type MessageResponse from "../interfaces/message-response.js";

import emojis from "./emojis.js";
import { routerKategori } from "./kategori.js";
import { routerKategoriAdmin } from "./kategoriAdmin.js";
import { routerOtentikasi } from "./otentikasi.js";

const router = express.Router();

router.get<object, MessageResponse>("/", (req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  });
});

router.use("/emojis", emojis);
router.use("/auth", routerOtentikasi);
router.use("/categories", routerKategori);

router.use("/admin/categories", routerKategoriAdmin);

export default router;
