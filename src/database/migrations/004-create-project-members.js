"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("project_members", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      projectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "projects", key: "id" },
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      role: {
        type: Sequelize.ENUM("viewer", "contributor", "maintainer"),
        allowNull: false,
        defaultValue: "viewer",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("project_members", ["projectId"]);
    await queryInterface.addIndex("project_members", ["userId"]);
    await queryInterface.addIndex("project_members", ["role"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("project_members");
  },
};
