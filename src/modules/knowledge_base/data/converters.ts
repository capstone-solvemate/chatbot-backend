import { ModelKnowledgeBase } from "~/models/ModelKnowledgeBase.js";

import type { KnowledgeBase } from "../domain/KnowledgeBase.js";

import { intToStatusKnowledgeBase, statusKnowledgeBaseToInt } from "../domain/StatusKnowledgeBase.js";

export function knowledgeBaseToModel(kb: KnowledgeBase): ModelKnowledgeBase {
  return ModelKnowledgeBase.build({
    doc_id: kb.docId,
    nama_berkas: kb.namaBerkas,
    path: kb.path,
    status: statusKnowledgeBaseToInt(kb.status),
  });
}

export function modelToKnowledgeBase(model: any): KnowledgeBase {
  return {
    id: BigInt(model.id),
    docId: model.doc_id as string,
    namaBerkas: model.nama_berkas as string,
    path: model.path as string,
    status: intToStatusKnowledgeBase(model.status as number),
    createdAt: model.created_at ? new Date(model.created_at) : undefined,
    updatedAt: model.updated_at ? new Date(model.updated_at) : undefined,
  };
}
