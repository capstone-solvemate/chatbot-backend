export enum StatusKnowledgeBase {
  BelumDiproses,
  SedangDiproses,
  SelesaiDiproses,
}

export function statusKnowledgeBaseToInt(status: StatusKnowledgeBase): number {
  switch (status) {
    case StatusKnowledgeBase.BelumDiproses:
      return 1;
    case StatusKnowledgeBase.SedangDiproses:
      return 2;
    case StatusKnowledgeBase.SelesaiDiproses:
      return 3;
  }
}

export function intToStatusKnowledgeBase(value: number): StatusKnowledgeBase {
  switch (value) {
    case 2:
      return StatusKnowledgeBase.SedangDiproses;
    case 3:
      return StatusKnowledgeBase.SelesaiDiproses;
    default:
      return StatusKnowledgeBase.BelumDiproses;
  }
}
