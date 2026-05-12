import express from "express";

import type MessageResponse from "../interfaces/message-response.js";

import routerChat from "./chat.js";
import emojis from "./emojis.js";
import { routerFaq } from "./endpoints/faq.js";
import { routerFaqAdmin } from "./endpoints/faqAdmin.js";
import { routerPenggunaAdmin } from "./endpoints/penggunaAdmin.js";
import { routerKategori } from "./kategori.js";
import { routerKategoriAdmin } from "./kategoriAdmin.js";
import { routerKnowledgeBase } from "./knowledgeBase.js";
import { routerNotifikasi } from "./notifikasi.js";
import { routerOtentikasi } from "./otentikasi.js";
import { routerTiket } from "./tiket.js";
import { routerUpload } from "./upload.js";

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
router.use("/tiket", routerTiket);

router.use("/admin/categories", routerKategoriAdmin);
router.use("/admin/faqs", routerFaqAdmin);
router.use("/admin/knowledge-base", routerKnowledgeBase);
router.use("/chat", routerChat);
router.use("/upload", routerUpload);
router.use("/admin/pengguna", routerPenggunaAdmin);

export default router;
