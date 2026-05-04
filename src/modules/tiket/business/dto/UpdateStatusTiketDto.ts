import type { StatusTiket } from "../../domain/StatusTiket.js";

export class UpdateStatusTiketDto {
  constructor(
    public status: StatusTiket,
  ) {}
}
