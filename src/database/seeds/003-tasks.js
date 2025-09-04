"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "tasks",
      [
        {
          title: "Configurar ambiente de desenvolvimento",
          description:
            "Instalar e configurar todas as dependências necessárias para o projeto",
          status: "done",
          priority: "high",
          dueDate: new Date("2024-01-15"),
          projectId: 1,
          assigneeId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "Criar estrutura do banco de dados",
          description: "Implementar migrations e models para o sistema",
          status: "done",
          priority: "high",
          dueDate: new Date("2024-01-20"),
          projectId: 1,
          assigneeId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "Implementar autenticação",
          description: "Criar sistema de login e autorização com JWT",
          status: "in_progress",
          priority: "high",
          dueDate: new Date("2024-01-25"),
          projectId: 1,
          assigneeId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "Criar CRUD de usuários",
          description:
            "Implementar operações básicas para gerenciamento de usuários",
          status: "todo",
          priority: "medium",
          dueDate: new Date("2024-01-30"),
          projectId: 1,
          assigneeId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "Implementar sistema de projetos",
          description: "Criar funcionalidades para gerenciamento de projetos",
          status: "todo",
          priority: "medium",
          dueDate: new Date("2024-02-05"),
          projectId: 1,
          assigneeId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "Desenvolver interface do usuário",
          description: "Criar componentes React para o frontend",
          status: "todo",
          priority: "medium",
          dueDate: new Date("2024-02-10"),
          projectId: 1,
          assigneeId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "Implementar testes automatizados",
          description: "Criar testes unitários e de integração",
          status: "todo",
          priority: "low",
          dueDate: new Date("2024-02-15"),
          projectId: 1,
          assigneeId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "Configurar CI/CD",
          description: "Implementar pipeline de integração e deploy contínuo",
          status: "todo",
          priority: "low",
          dueDate: new Date("2024-02-20"),
          projectId: 1,
          assigneeId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("tasks", null, {});
  },
};
