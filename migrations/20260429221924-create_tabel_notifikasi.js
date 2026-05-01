"use strict";

const { NAMA_TABEL_PENGGUNA } = require("./20260417022138-create_tabel_pengguna");

const NAMA_TABEL = "notifikasi";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(NAMA_TABEL, {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      id_pengguna: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: NAMA_TABEL_PENGGUNA,
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      type: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      judul: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },

      deskripsi: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      extra_data: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      dibuat_pada: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      dibaca_pada: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // index tambahan
    await queryInterface.addIndex(NAMA_TABEL, ["id_pengguna"]);
    await queryInterface.addIndex(NAMA_TABEL, ["dibuat_pada"]);
    await queryInterface.addIndex(NAMA_TABEL, ["dibaca_pada"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable(NAMA_TABEL);
  },
};
