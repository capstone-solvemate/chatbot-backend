export enum StatusKnowledgeBase {
  BelumDiproses,
  SedangDiproses,
  SelesaiDiproses,
  GagalDiproses,
}

export function statusKnowledgeBaseToInt(status: StatusKnowledgeBase): number {
  switch (status) {
    case StatusKnowledgeBase.BelumDiproses:
      return 1;
    case StatusKnowledgeBase.SedangDiproses:
      return 2;
    case StatusKnowledgeBase.SelesaiDiproses:
      return 3;
    case StatusKnowledgeBase.GagalDiproses:
      return 4;
  }
}

export function intToStatusKnowledgeBase(value: number): StatusKnowledgeBase {
  switch (value) {
    case 2:
      return StatusKnowledgeBase.SedangDiproses;
    case 3:
      return StatusKnowledgeBase.SelesaiDiproses;
    case 4:
      return StatusKnowledgeBase.GagalDiproses;
    default:
      return StatusKnowledgeBase.BelumDiproses;
  }
}
