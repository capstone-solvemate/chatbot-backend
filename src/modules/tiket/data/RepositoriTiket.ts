import type { Model, ModelStatic, Sequelize, WhereOptions } from "sequelize";

import { Op } from "sequelize";

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

export type TiketDenganPembuatLengkap = TiketDenganPembuat & {
  emailPembuat: string;
};

function modelToTiketDenganPembuat(model: any): TiketDenganPembuat {
  return {
    tiket: modelToTiket(model),
    namaPembuat: model.pembuat?.nama ?? "",
  };
}

function modelToTiketDenganPembuatLengkap(model: any): TiketDenganPembuatLengkap {
  return {
    tiket: modelToTiket(model),
    namaPembuat: model.pembuat?.nama ?? "",
    emailPembuat: model.pembuat?.email ?? "",
  };
}

export class RepositoriTiket {
  constructor(
    private readonly modelTiket: ModelStatic<Model<any, any>>,
    private readonly modelPengguna: ModelStatic<Model<any, any>>,
    private readonly modelPesanTiket: ModelStatic<Model<any, any>>,
    private readonly modelChat: ModelStatic<Model<any, any>>,
    private readonly sequelize: Sequelize,
  ) {}

  async buatTiket(data: Omit<Tiket, "id">): Promise<Tiket> {
    const now = new Date();

    const tx = await this.sequelize.transaction();
    try {
      const model = await this.modelTiket.create({
        judul: data.judul,
        deskripsi: data.deskripsi,
        id_pembuat: data.idPembuat,
        id_chat: data.idChat.toString(),
        id_kategori: data.idKategori,
        status: data.status,
        dibuat_pada: now,
        diperbarui_pada: now,
      }, { transaction: tx });

      await this.modelChat.update(
        { dialihkan_ke_tiket: true },
        { where: { id: data.idChat.toString() }, transaction: tx },
      );

      await tx.commit();
      return modelToTiket(model);
    }
    catch (e) {
      await tx.rollback();
      throw e;
    }
  }

  async getById(id: bigint): Promise<TiketDenganPembuat | null> {
    const model = await this.modelTiket.findByPk(id.toString(), {
      include: {
        model: this.modelPengguna,
        as: "pembuat",
        attributes: ["nama"],
      },
    });
    return model ? modelToTiketDenganPembuat(model) : null;
  }

  async getByIdLengkap(id: bigint): Promise<TiketDenganPembuatLengkap | null> {
    const model = await this.modelTiket.findByPk(id.toString(), {
      include: {
        model: this.modelPengguna,
        as: "pembuat",
        attributes: ["nama", "email"],
      },
    });
    return model ? modelToTiketDenganPembuatLengkap(model) : null;
  }

  async getByPembuat(idPembuat: number): Promise<TiketDenganPembuat[]> {
    const models = await this.modelTiket.findAll({
      where: { id_pembuat: idPembuat },
      include: {
        model: this.modelPengguna,
        as: "pembuat",
        attributes: ["nama"],
      },
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

    const models = await this.modelTiket.findAll({
      where,
      include: {
        model: this.modelPengguna,
        as: "pembuat",
        attributes: ["nama"],
      },
      order: [["dibuat_pada", "DESC"]],
    });
    return models.map(modelToTiketDenganPembuat);
  }

  async updateStatus(id: bigint, status: StatusTiket): Promise<void> {
    await this.modelTiket.update(
      { status, diperbarui_pada: new Date() },
      { where: { id: id.toString() } },
    );
  }

  async buatPesanTiket(data: Omit<PesanTiket, "id">): Promise<PesanTiket> {
    const model = await this.modelPesanTiket.create({
      id_tiket: data.idTiket.toString(),
      id_pembuat: data.idPembuat,
      pesan: data.pesan,
      dibuat_pada: data.dibuatPada,
    });
    return modelToPesanTiket(model);
  }

  async getPesanByTiket(idTiket: bigint): Promise<PesanTiket[]> {
    const models = await this.modelPesanTiket.findAll({
      where: { id_tiket: idTiket.toString() },
      order: [["dibuat_pada", "ASC"]],
    });
    return models.map(modelToPesanTiket);
  }
}
