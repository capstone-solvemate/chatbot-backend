import { UniqueConstraintError } from "sequelize";
import * as uuid from "uuid";

import { ModelSession } from "~/models/ModelSession.js";

import type { PeranPengguna } from "../domain/PeranPengguna.js";
import type { Session } from "../domain/Session.js";

import { modelToSession, sessionToModel } from "../data/model/converters.js";
import { peranPenggunaToInt } from "../domain/PeranPengguna.js";

export class RepositoriSession {
  static readonly instance = new RepositoriSession();
  private constructor() {}

  async getById(id: string): Promise<Session | null> {
    const modelSession = await ModelSession.findByPk(id);
    if (!modelSession) {
      return null;
    }
    const session = modelToSession(modelSession);
    return session;
  };

  async buatSession(session: Session): Promise<void> {
    const { id, ...modelSession } = sessionToModel(session);

    const newId = uuid.v4().toString();
    session.id = newId;

    try {
      await ModelSession.create({
        id: newId,
        ...modelSession,
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
    await ModelSession.update({
      id_pengguna: data?.idPengguna ?? null,
      peran_pengguna: (data !== null) ? peranPenggunaToInt(data!.peran) : null,
    }, {
      where: {
        id: idSession,
      },
    });
  }

  async updateAktivitas(idSession: string): Promise<void> {
    await ModelSession.update({
      aktivitas_terakhir_pada: new Date(),
    }, {
      where: {
        id: idSession,
      },
    });
  }
}
