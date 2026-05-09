import type { Model, ModelStatic } from "sequelize";

import { Op } from "sequelize";

import { ConflictError } from "~/core/types/ConflictError.js";
import { DI } from "~/di/DI.js";

import type { Pengguna } from "../domain/Pengguna.js";

import { intToPeranPengguna } from "../domain/PeranPengguna.js";
import { modelToPengguna, penggunaToRow, penggunaToRowPeran } from "./converters.js";

export class RepositoriPengguna {
  constructor(
    private readonly modelPengguna: ModelStatic<Model<any, any>>,
    private readonly modelPeranPengguna: ModelStatic<Model<any, any>>,
  ) {}

  async getPenggunaByEmail(email: string, besertaPeran: boolean = true): Promise<Pengguna | null> {
    const modelPengguna = await this.modelPengguna.findOne({ where: { email } });
    if (!modelPengguna) {
      return null;
    }
    const pengguna = modelToPengguna(modelPengguna);

    if (besertaPeran) {
      const listModelPeran = await this.modelPeranPengguna.findAll({
        where: {
          id_pengguna: pengguna.id,
        },
      });
      for (const modelPeran of (listModelPeran as any[])) {
        let peranInt = 0;
        if (typeof modelPeran.peran === "number") {
          peranInt = modelPeran.peran;
        }
        const peran = intToPeranPengguna(peranInt);
        if (peran !== null) {
          pengguna.peran.push(peran);
        }
      }
    }

    return pengguna;
  }

  async getPenggunaById(id: number): Promise<Pengguna | null> {
    const modelPengguna = await this.modelPengguna.findOne({ where: { id } });
    if (!modelPengguna) {
      return null;
    }

    const pengguna = modelToPengguna(modelPengguna);
    return pengguna;
  }

  async updatePassword(email: string, passwordHash: string): Promise<void> {
    await this.modelPengguna.update(
      { password: passwordHash },
      { where: { email } },
    );
  }

  async tambahPengguna(pengguna: Pengguna): Promise<void> {
    pengguna.id = 0;

    const emailSudahAda = await this.modelPengguna.findOne({
      where: { email: pengguna.email },
      attributes: ["id"],
    });
    if (emailSudahAda) {
      throw new ConflictError("email");
    }

    const row = penggunaToRow(pengguna);

    const tx = await DI.provideSequelize().transaction();
    try {
      const result = await this.modelPengguna.create(row, { transaction: tx });
      pengguna.id = result.get("id") as number;

      const rowsPeran = penggunaToRowPeran(pengguna);
      for (const rowPeran of rowsPeran) {
        await this.modelPeranPengguna.create(rowPeran, { transaction: tx });
      }

      await tx.commit();
    }
    catch (e: any) {
      await tx.rollback();
      throw e;
    }
  }

  async getPengguna(filterNama: string | null): Promise<Pengguna[]> {
    let where: Record<string, any> | undefined;

    if (filterNama) {
      where = {
        nama: {
          [Op.like]: `%${filterNama}%`,
        },
      };
    }

    const modelPengguna = await this.modelPengguna.findAll({
      where,
      include: {
        model: this.modelPeranPengguna,
        as: "ModelPeranPengguna",
      },
    });

    const pengguna = modelPengguna.map(model => modelToPengguna(model.toJSON()));
    return pengguna;
  }
}
