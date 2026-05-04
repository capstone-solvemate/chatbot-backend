import type { WhereOptions } from "sequelize";

import { Op } from "sequelize";

import { ModelPengguna } from "~/models/ModelPengguna.js";
import { ModelPesanTiket } from "~/models/ModelPesanTiket.js";
import { ModelTiket } from "~/models/ModelTiket.js";

import type { PesanTiket } from "../domain/PesanTiket.js";
import type { StatusTiket } from "../domain/StatusTiket.js";
import type { Tiket } from "../domain/Tiket.js";

import { modelToPesanTiket, modelToTiket } from "./converters.js";

export type FilterTiket = {
  status?: StatusTiket;
  idKategori?: number;
  kata?: string;
};

export type TiketDenganPembuat = {
  tiket: Tiket;
  namaPembuat: string;
};

const includeNamaPembuat = [
  {
    model: ModelPengguna,
    as: "pembuat",
    attributes: ["nama"],
  },
];

function modelToTiketDenganPembuat(model: any): TiketDenganPembuat {
  return {
    tiket: modelToTiket(model),
    namaPembuat: model.pembuat?.nama ?? "",
  };
}

export class RepositoriTiket {
  static readonly instance = new RepositoriTiket();
  private constructor() {}

  async buatTiket(data: Omit<Tiket, "id">): Promise<Tiket> {
    const now = new Date();
    const model = await ModelTiket.create({
      judul: data.judul,
      deskripsi: data.deskripsi,
      id_pembuat: data.idPembuat,
      id_chat: data.idChat.toString(),
      id_kategori: data.idKategori,
      status: data.status,
      dibuat_pada: now,
      diperbarui_pada: now,
    });
    return modelToTiket(model);
  }

  async getById(id: bigint): Promise<TiketDenganPembuat | null> {
    const model = await ModelTiket.findByPk(id.toString(), {
      include: includeNamaPembuat,
    });
    return model ? modelToTiketDenganPembuat(model) : null;
  }

  async getByPembuat(idPembuat: number): Promise<TiketDenganPembuat[]> {
    const models = await ModelTiket.findAll({
      where: { id_pembuat: idPembuat },
      include: includeNamaPembuat,
      order: [["dibuat_pada", "DESC"]],
    });
    return models.map(modelToTiketDenganPembuat);
  }

  async getAll(filter: FilterTiket = {}): Promise<TiketDenganPembuat[]> {
    const where: WhereOptions = {};

    if (filter.status !== undefined) {
      where.status = filter.status;
    }
    if (filter.idKategori !== undefined) {
      where.id_kategori = filter.idKategori;
    }
    if (filter.kata !== undefined && filter.kata.trim() !== "") {
      where[Op.or as any] = [
        { judul: { [Op.like]: `%${filter.kata.trim()}%` } },
        { deskripsi: { [Op.like]: `%${filter.kata.trim()}%` } },
      ];
    }

    const models = await ModelTiket.findAll({
      where,
      include: includeNamaPembuat,
      order: [["dibuat_pada", "DESC"]],
    });
    return models.map(modelToTiketDenganPembuat);
  }

  async updateStatus(id: bigint, status: StatusTiket): Promise<void> {
    await ModelTiket.update(
      { status, diperbarui_pada: new Date() },
      { where: { id: id.toString() } },
    );
  }

  async buatPesanTiket(data: Omit<PesanTiket, "id">): Promise<PesanTiket> {
    const model = await ModelPesanTiket.create({
      id_tiket: data.idTiket.toString(),
      id_pembuat: data.idPembuat,
      pesan: data.pesan,
      dibuat_pada: data.dibuatPada,
    });
    return modelToPesanTiket(model);
  }

  async getPesanByTiket(idTiket: bigint): Promise<PesanTiket[]> {
    const models = await ModelPesanTiket.findAll({
      where: { id_tiket: idTiket.toString() },
      order: [["dibuat_pada", "ASC"]],
    });
    return models.map(modelToPesanTiket);
  }
}
