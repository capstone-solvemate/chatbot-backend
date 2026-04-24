"use strict";

const { NAMA_TABEL_PENGGUNA } = require("./20260417022138-create_tabel_pengguna");

const NAMA_TABEL = "session";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(NAMA_TABEL, {
      id: {
        type: Sequelize.STRING(36),
        primaryKey: true,
        allowNull: false,
      },

      id_pengguna: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: NAMA_TABEL_PENGGUNA,
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      peran_pengguna: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      csrf_token: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      aktivitas_terakhir_pada: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // index tambahan
    await queryInterface.addIndex(NAMA_TABEL, ["id_pengguna"]);
    await queryInterface.addIndex(NAMA_TABEL, ["aktivitas_terakhir_pada"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable(NAMA_TABEL);
  },
};
