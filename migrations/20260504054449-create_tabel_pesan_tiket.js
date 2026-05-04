"use strict";

const { NAMA_TABEL_PENGGUNA } = require("./20260417022138-create_tabel_pengguna");
const { NAMA_TABEL_TIKET } = require("./20260504054405-create_tabel_tiket");

const NAMA_TABEL = "pesan_tiket";

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
      id_tiket: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: NAMA_TABEL_TIKET,
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
      pesan: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      dibuat_pada: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex(NAMA_TABEL, ["id_tiket"]);
    await queryInterface.addIndex(NAMA_TABEL, ["id_pembuat"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable(NAMA_TABEL);
  },
};
