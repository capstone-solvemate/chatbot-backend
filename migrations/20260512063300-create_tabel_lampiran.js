"use strict";

const { NAMA_TABEL_PENGGUNA } = require("./20260417022138-create_tabel_pengguna");

const NAMA_TABEL = "lampiran";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  NAMA_TABEL_LAMPIRAN: NAMA_TABEL,
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(NAMA_TABEL, {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      jenis_pesan: {
        type: Sequelize.ENUM("chat", "tiket"),
        allowNull: false,
      },
      id_pesan: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      id_pengunggah: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: NAMA_TABEL_PENGGUNA,
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      nama_asli: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      nama_berkas: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      path: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      ukuran: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      dibuat_pada: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex(NAMA_TABEL, ["jenis_pesan", "id_pesan"]);
    await queryInterface.addIndex(NAMA_TABEL, ["id_pengunggah"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable(NAMA_TABEL);
  },
};
