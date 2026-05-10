"use strict";

const NAMA_TABEL = "faq_survei";
const { NAMA_TABEL_PENGGUNA } = require("./20260417022138-create_tabel_pengguna");
const { NAMA_TABEL_FAQ } = require("./20260426002241-create_tabel_faq");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  NAMA_TABEL_FAQ_SURVEI: NAMA_TABEL,
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(NAMA_TABEL, {
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

      id_pengguna: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: NAMA_TABEL_PENGGUNA,
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      // 1 = ya (helpful), 0 = tidak
      jawaban: {
        type: Sequelize.TINYINT,
        allowNull: false,
      },

      dijawab_pada: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Composite PK — 1 survei per user per FAQ
    await queryInterface.addConstraint(NAMA_TABEL, {
      fields: ["id_faq", "id_pengguna"],
      type: "primary key",
      name: "pk_faq_survei",
    });

    // Covering index untuk COUNT WHERE id_faq = ? AND jawaban = 1
    // PK sudah cover lookup by id_faq, index ini mempercepat filter jawaban
    await queryInterface.addIndex(NAMA_TABEL, ["id_faq", "jawaban"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable(NAMA_TABEL);
  },
};
