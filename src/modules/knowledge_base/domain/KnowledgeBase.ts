import type { StatusKnowledgeBase } from "./StatusKnowledgeBase.js";

export type KnowledgeBase = {
  id: bigint;
  docId: string;
  judul: string;
  idKategori: number;
  namaBerkas: string;
  path: string;
  status: StatusKnowledgeBase;
  createdAt?: Date;
  updatedAt?: Date;
};
