"use strict";

const { NAMA_TABEL_PENGGUNA } = require("./20260417022138-create_tabel_pengguna");

const NAMA_TABEL = "chat";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  NAMA_TABEL_CHAT: NAMA_TABEL,
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(NAMA_TABEL, {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      id_pembuat: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: NAMA_TABEL_PENGGUNA,
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      subjek: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      tanggal_dibuat: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // index tambahan
    await queryInterface.addIndex(NAMA_TABEL, ["id_pembuat"]);
    await queryInterface.addIndex(NAMA_TABEL, ["tanggal_dibuat"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable(NAMA_TABEL);
  },
};
