import type { KnowledgeBase } from "../../domain/KnowledgeBase.js";
import type { KnowledgeBaseResponseDto } from "./KnowledgeBaseResponseDto.js";

import { statusKnowledgeBaseToInt } from "../../domain/StatusKnowledgeBase.js";

export function toResponseDto(doc: KnowledgeBase): KnowledgeBaseResponseDto {
  return {
    id: doc.id.toString(),
    docId: doc.docId,
    judul: doc.judul,
    idKategori: doc.idKategori,
    namaBerkas: doc.namaBerkas,
    status: statusKnowledgeBaseToInt(doc.status),
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}
