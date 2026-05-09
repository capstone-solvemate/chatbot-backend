import type { Model, ModelStatic } from "sequelize";

import { UniqueConstraintError } from "sequelize";
import * as uuid from "uuid";

import type { PeranPengguna } from "../../pengguna/domain/PeranPengguna.js";
import type { Session } from "../domain/Session.js";

import { peranPenggunaToInt } from "../../pengguna/domain/PeranPengguna.js";
import { modelToSession, sessionToModel } from "../data/model/converters.js";

export class RepositoriSession {
  constructor(
    private readonly modelSession: ModelStatic<Model<any, any>>,
  ) {}

  async getById(id: string): Promise<Session | null> {
    const modelSession = await this.modelSession.findByPk(id);
    if (!modelSession) {
      return null;
    }
    const session = modelToSession(modelSession);
    return session;
  };

  async buatSession(session: Session): Promise<void> {
    const { id, ...rowsSession } = sessionToModel(session);

    const newId = uuid.v4().toString();
    session.id = newId;

    try {
      await this.modelSession.create({
        id: newId,
        ...rowsSession,
      });
    }
    catch (e: any) {
      if (e instanceof UniqueConstraintError) {
        await this.buatSession(session);
      }
      else {
        console.error(e);
        throw e;
      }
    }
  }

  async updatePenggunaTerotentikasi(idSession: string, data: { idPengguna: number; peran: PeranPengguna } | null): Promise<void> {
    await this.modelSession.update({
      id_pengguna: data?.idPengguna ?? null,
      peran_pengguna: (data !== null) ? peranPenggunaToInt(data!.peran) : null,
    }, {
      where: {
        id: idSession,
      },
    });
  }

  async updateAktivitas(idSession: string): Promise<void> {
    await this.modelSession.update({
      aktivitas_terakhir_pada: new Date(),
    }, {
      where: {
        id: idSession,
      },
    });
  }
}
