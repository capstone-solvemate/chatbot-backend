import express from "express";

import type MessageResponse from "../interfaces/message-response.js";

import emojis from "./emojis.js";
import { routerFaq } from "./faq.js";
import { routerFaqAdmin } from "./faqAdmin.js";
import { routerKategori } from "./kategori.js";
import { routerKategoriAdmin } from "./kategoriAdmin.js";
import { routerNotifikasi } from "./notifikasi.js";
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
router.use("/faqs", routerFaq);
router.use("/notifikasi", routerNotifikasi);

router.use("/admin/categories", routerKategoriAdmin);
router.use("/admin/faqs", routerFaqAdmin);

export default router;
