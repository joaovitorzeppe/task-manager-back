"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("task_comments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      taskId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "tasks", key: "id" },
      },
      authorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("task_comments", ["taskId"]);
    await queryInterface.addIndex("task_comments", ["authorId"]);
    await queryInterface.addIndex("task_comments", ["createdAt"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("task_comments");
  },
};
