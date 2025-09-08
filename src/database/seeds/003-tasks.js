"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const projectIds = [1, 2, 3, 4, 5];
    const assigneeIds = [null, 3, 4, 5, null, 3, 4, 5, null, null];
    const statuses = ["done", "in_progress", "todo", "review"];
    for (const projectId of projectIds) {
      await queryInterface.bulkInsert(
        "tasks",
        [
          {
            title: "Configurar ambiente de desenvolvimento",
            description:
              "Instalar e configurar todas as dependências necessárias para o projeto",
            status: statuses[parseInt(Math.random() * 4)],
            priority: "high",
            dueDate: new Date("2025-09-15"),
            projectId,
            assigneeId: assigneeIds[parseInt(Math.random() * 10)],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            title: "Criar estrutura do banco de dados",
            description: "Implementar migrations e models para o sistema",
            status: statuses[parseInt(Math.random() * 4)],
            priority: "high",
            dueDate: new Date("2025-09-20"),
            projectId,
            assigneeId: assigneeIds[parseInt(Math.random() * 10)],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            title: "Implementar autenticação",
            description: "Criar sistema de login e autorização com JWT",
            status: statuses[parseInt(Math.random() * 4)],
            priority: "high",
            dueDate: new Date("2025-09-25"),
            projectId,
            assigneeId: assigneeIds[parseInt(Math.random() * 10)],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            title: "Criar CRUD de usuários",
            description:
              "Implementar operações básicas para gerenciamento de usuários",
            status: statuses[parseInt(Math.random() * 4)],
            priority: "medium",
            dueDate: new Date("2025-09-30"),
            projectId,
            assigneeId: assigneeIds[parseInt(Math.random() * 10)],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            title: "Implementar sistema de projetos",
            description: "Criar funcionalidades para gerenciamento de projetos",
            status: statuses[parseInt(Math.random() * 4)],
            priority: "medium",
            dueDate: new Date("2025-09-05"),
            projectId,
            assigneeId: assigneeIds[parseInt(Math.random() * 10)],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            title: "Desenvolver interface do usuário",
            description: "Criar componentes React para o frontend",
            status: statuses[parseInt(Math.random() * 4)],
            priority: "medium",
            dueDate: new Date("2025-02-10"),
            projectId,
            assigneeId: assigneeIds[parseInt(Math.random() * 10)],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            title: "Implementar testes automatizados",
            description: "Criar testes unitários e de integração",
            status: statuses[parseInt(Math.random() * 4)],
            priority: "low",
            dueDate: new Date("2025-09-15"),
            projectId,
            assigneeId: assigneeIds[parseInt(Math.random() * 10)],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            title: "Configurar CI/CD",
            description: "Implementar pipeline de integração e deploy contínuo",
            status: statuses[parseInt(Math.random() * 4)],
            priority: "low",
            dueDate: new Date("2025-09-20"),
            projectId,
            assigneeId: assigneeIds[parseInt(Math.random() * 10)],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        {}
      );
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("tasks", null, {});
  },
};
