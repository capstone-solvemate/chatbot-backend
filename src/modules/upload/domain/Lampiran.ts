export type JenisPesan = "chat" | "tiket";

export class Lampiran {
  constructor(
    public readonly id: bigint,
    public readonly jenisPesan: JenisPesan,
    public readonly idPesan: bigint | null,
    public readonly idPengunggah: number,
    public readonly namaAsli: string,
    public readonly namaBerkas: string,
    public readonly path: string,
    public readonly ukuran: number,
    public readonly mimeType: string,
    public readonly dibuatPada: Date,
  ) {}

  get url(): string {
    return `/${this.path}`;
  }
}
