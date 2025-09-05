"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("123456", 10);

    await queryInterface.bulkInsert(
      "users",
      [
        {
          name: "João Silva",
          email: "joao@exemplo.com",
          password: hashedPassword,
          role: "admin",
        },
        {
          name: "Maria Santos",
          email: "maria@exemplo.com",
          password: hashedPassword,
          role: "manager",
        },
        {
          name: "Pedro Oliveira",
          email: "pedro@exemplo.com",
          password: hashedPassword,
          role: "developer",
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
