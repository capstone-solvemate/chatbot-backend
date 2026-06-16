import type { Model, ModelStatic, Sequelize, WhereOptions } from "sequelize";

import { col, fn, Op, UniqueConstraintError } from "sequelize";

import { ConflictError } from "~/core/types/ConflictError.js";

import type { PesanTiket } from "../domain/PesanTiket.js";
import type { Tiket } from "../domain/Tiket.js";

import { intToStatusTiket, StatusTiket } from "../domain/StatusTiket.js";
import { modelToPesanTiket, rowToTiket } from "./converters.js";

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
    tiket: rowToTiket(model),
    namaPembuat: model.pembuat?.nama ?? "",
  };
}

function modelToTiketDenganPembuatLengkap(model: any): TiketDenganPembuatLengkap {
  return {
    tiket: rowToTiket(model),
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
      const row = await this.modelTiket.create({
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
      return rowToTiket(row);
    }
    catch (e) {
      await tx.rollback();
      if (e instanceof UniqueConstraintError) {
        const hasIdChat = Object.keys(e.fields).some(key => /id_chat/.test(key));
        if (hasIdChat) {
          throw new ConflictError("id_chat");
        }
      }
      throw e;
    }
  }

  async getByIdChat(idChat: bigint): Promise<TiketDenganPembuat | null> {
    const model = await this.modelTiket.findOne({
      where: { id_chat: idChat.toString() },
      include: {
        model: this.modelPengguna,
        as: "pembuat",
        attributes: ["nama"],
      },
    });
    return model ? modelToTiketDenganPembuat(model) : null;
  }

  async isPesanTiketExists(idTiket: bigint, idPesan: bigint): Promise<boolean> {
    const pesanTiket = await this.modelPesanTiket.findOne({
      where: {
        id_tiket: idTiket.toString(),
        id: idPesan.toString(),
      },
    });
    return !!pesanTiket;
  }

  async getByIdChatLengkap(idChat: bigint): Promise<TiketDenganPembuatLengkap | null> {
    const model = await this.modelTiket.findOne({
      where: { id_chat: idChat.toString() },
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

  async updateStatus(idChat: bigint, status: StatusTiket): Promise<void> {
    await this.modelTiket.update(
      { status, diperbarui_pada: new Date() },
      { where: { id_chat: idChat.toString() } },
    );
  }

  async getPesanByTiket(idChat: bigint): Promise<PesanTiket[]> {
    // Resolve id tiket dari id_chat terlebih dahulu
    const modelTiket = await this.modelTiket.findOne({
      where: { id_chat: idChat.toString() },
      attributes: ["id"],
    });
    if (!modelTiket) {
      return [];
    }
    const idTiket = modelTiket.getDataValue("id").toString();

    const models = await this.modelPesanTiket.findAll({
      where: { id_tiket: idTiket },
      order: [["dibuat_pada", "ASC"]],
    });
    return models.map(modelToPesanTiket);
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

  // Di interface RepositoriTiket (jika ada interface terpisah), tambahkan:
  async getRingkasanStatusByPembuat(idPembuat: number): Promise<{ open: number; inProgress: number; done: number }> {
    const rows = await this.modelTiket.findAll({
      attributes: [
        "status",
        [fn("COUNT", col("id")), "jumlah"],
      ],
      where: { id_pembuat: idPembuat },
      group: ["status"],
      raw: true,
    }) as unknown as Array<{ status: number; jumlah: string }>;

    const hasil = { open: 0, inProgress: 0, done: 0 };
    for (const row of rows) {
      const jumlah = Number(row.jumlah);
      const status = intToStatusTiket(row.status);
      if (status === StatusTiket.Open)
        hasil.open = jumlah;
      else if (status === StatusTiket.InProgress)
        hasil.inProgress = jumlah;
      else if (status === StatusTiket.Done)
        hasil.done = jumlah;
    }

    return hasil;
  }
}
