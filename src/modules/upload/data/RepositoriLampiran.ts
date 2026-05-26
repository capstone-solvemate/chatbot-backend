import type { Model, ModelStatic } from "sequelize";

import { Op } from "sequelize";

import type { JenisPesan } from "../domain/Lampiran.js";

import { Lampiran } from "../domain/Lampiran.js";

type ModelLampiran = ModelStatic<Model>;

export class RepositoriLampiran {
  constructor(
    private readonly modelLampiran: ModelLampiran,
  ) {}

  // --- Helper ---

  private rowKeLampiran(row: Model): Lampiran {
    return new Lampiran(
      BigInt(row.getDataValue("id")),
      row.getDataValue("jenis_pesan"),
      row.getDataValue("id_pesan") !== null ? BigInt(row.getDataValue("id_pesan")) : null,
      row.getDataValue("id_pengunggah"),
      row.getDataValue("nama_asli"),
      row.getDataValue("nama_berkas"),
      row.getDataValue("path"),
      Number(row.getDataValue("ukuran")),
      row.getDataValue("mime_type"),
      row.getDataValue("dibuat_pada"),
    );
  }

  // --- CRUD ---

  async simpan(data: Omit<Lampiran, "id" | "url">): Promise<Lampiran> {
    const row = await this.modelLampiran.create({
      jenis_pesan: data.jenisPesan,
      id_pesan: data.idPesan !== null ? data.idPesan.toString() : null,
      id_pengunggah: data.idPengunggah,
      nama_asli: data.namaAsli,
      nama_berkas: data.namaBerkas,
      path: data.path,
      ukuran: data.ukuran,
      mime_type: data.mimeType,
      dibuat_pada: data.dibuatPada,
    });
    return this.rowKeLampiran(row);
  }

  async getById(id: bigint): Promise<Lampiran | null> {
    const row = await this.modelLampiran.findByPk(id.toString());
    return row ? this.rowKeLampiran(row) : null;
  }

  async getByNamaBerkas(namaBerkas: string): Promise<Lampiran | null> {
    const row = await this.modelLampiran.findOne({ where: { nama_berkas: namaBerkas } });
    return row ? this.rowKeLampiran(row) : null;
  }

  async getByIdPesan(jenisPesan: JenisPesan, idPesan: bigint): Promise<Lampiran[]> {
    const rows = await this.modelLampiran.findAll({
      where: {
        jenis_pesan: jenisPesan,
        id_pesan: idPesan.toString(),
      },
      order: [["dibuat_pada", "ASC"]],
    });
    return rows.map(r => this.rowKeLampiran(r));
  }

  /**
   * Batch-fetch lampiran untuk banyak pesan sekaligus.
   * Mengembalikan Map<string(idPesan), Lampiran[]>.
   */
  async getByIdPesanBatch(jenisPesan: JenisPesan, idPesanList: bigint[]): Promise<Map<string, Lampiran[]>> {
    if (idPesanList.length === 0) {
      return new Map();
    }

    const rows = await this.modelLampiran.findAll({
      where: {
        jenis_pesan: jenisPesan,
        id_pesan: { [Op.in]: idPesanList.map(id => id.toString()) },
      },
      order: [["dibuat_pada", "ASC"]],
    });

    const map = new Map<string, Lampiran[]>();
    for (const row of rows) {
      const lampiran = this.rowKeLampiran(row);
      const key = lampiran.idPesan!.toString();
      const existing = map.get(key) ?? [];
      existing.push(lampiran);
      map.set(key, existing);
    }
    return map;
  }

  async hapus(id: bigint): Promise<boolean> {
    const deleted = await this.modelLampiran.destroy({
      where: { id: id.toString() },
    });
    return deleted > 0;
  }
}
