export enum StatusTiket {
  Open = 1,
  InProgress = 2,
  Done = 3,
}

export function intToStatusTiket(value: number): StatusTiket {
  switch (value) {
    case 1: return StatusTiket.Open;
    case 2: return StatusTiket.InProgress;
    case 3: return StatusTiket.Done;
    default: return StatusTiket.Open;
  }
}

export function statusTiketToString(status: StatusTiket): string {
  switch (status) {
    case StatusTiket.Open: return "Open";
    case StatusTiket.InProgress: return "In Progress";
    case StatusTiket.Done: return "Done";
  }
}

export function statusTiketToStringV2(status: StatusTiket): string {
  switch (status) {
    case StatusTiket.Open: return "Open";
    case StatusTiket.InProgress: return "In Progress";
    case StatusTiket.Done: return "Resolved";
  }
}
