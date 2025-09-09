"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("attachments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      filename: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mimeType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      path: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      projectId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "projects", key: "id" },
      },
      taskId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "tasks", key: "id" },
      },
      taskCommentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "task_comments", key: "id" },
      },
      uploadedById: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
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

    await queryInterface.addIndex("attachments", ["projectId"]);
    await queryInterface.addIndex("attachments", ["taskId"]);
    await queryInterface.addIndex("attachments", ["taskCommentId"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("attachments");
  },
};
