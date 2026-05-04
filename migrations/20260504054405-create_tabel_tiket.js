"use strict";

const { NAMA_TABEL_PENGGUNA } = require("./20260417022138-create_tabel_pengguna");

const NAMA_TABEL = "tiket";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  NAMA_TABEL_TIKET: NAMA_TABEL,
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(NAMA_TABEL, {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      judul: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      deskripsi: {
        type: Sequelize.TEXT,
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
        onDelete: "RESTRICT",
      },
      id_chat: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "chat",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      id_kategori: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "kategori",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      dibuat_pada: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      diperbarui_pada: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex(NAMA_TABEL, ["id_pembuat"]);
    await queryInterface.addIndex(NAMA_TABEL, ["id_kategori"]);
    await queryInterface.addIndex(NAMA_TABEL, ["status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable(NAMA_TABEL);
  },
};
