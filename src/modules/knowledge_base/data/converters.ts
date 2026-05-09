import type { KnowledgeBase } from "../domain/KnowledgeBase.js";

import { intToStatusKnowledgeBase, statusKnowledgeBaseToInt } from "../domain/StatusKnowledgeBase.js";

type KnowledgeBaseRow = {
  doc_id: string;
  judul: string;
  id_kategori: number;
  nama_berkas: string;
  ukuran_berkas: number;
  path: string;
  status: number;
};

export function knowledgeBaseToRow(kb: KnowledgeBase): KnowledgeBaseRow {
  return {
    doc_id: kb.docId,
    judul: kb.judul,
    id_kategori: kb.idKategori,
    nama_berkas: kb.namaBerkas,
    ukuran_berkas: kb.ukuranBerkas,
    path: kb.path,
    status: statusKnowledgeBaseToInt(kb.status),
  };
}

export function modelToKnowledgeBase(model: any): KnowledgeBase {
  return {
    id: BigInt(model.id),
    docId: model.doc_id as string,
    judul: model.judul as string,
    idKategori: model.id_kategori as number,
    namaBerkas: model.nama_berkas as string,
    ukuranBerkas: Number(model.ukuran_berkas),
    path: model.path as string,
    status: intToStatusKnowledgeBase(model.status as number),
    createdAt: model.created_at ? new Date(model.created_at) : undefined,
    updatedAt: model.updated_at ? new Date(model.updated_at) : undefined,
  };
}
