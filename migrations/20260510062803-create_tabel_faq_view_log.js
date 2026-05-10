"use strict";

const NAMA_TABEL = "faq_view_log";
const { NAMA_TABEL_PENGGUNA } = require("./20260417022138-create_tabel_pengguna");
const { NAMA_TABEL_FAQ } = require("./20260426002241-create_tabel_faq");

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

      id_faq: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: NAMA_TABEL_FAQ,
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      // Nullable — kalau ke depan ada guest view, tetap bisa ditampung
      id_pengguna: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: NAMA_TABEL_PENGGUNA,
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      dilihat_pada: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Index utama untuk JOIN saat recalculate (tidak dipakai query home — pakai cached counter)
    await queryInterface.addIndex(NAMA_TABEL, ["id_faq"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable(NAMA_TABEL);
  },
};
