"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const projects = [
      {
        name: "Sistema de Gestão de Projetos",
        description:
          "Sistema completo para gestão de projetos, tarefas e equipes",
        status: "active",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
        managerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Portal do Cliente",
        description:
          "Portal web para clientes acessarem informações e serviços",
        status: "planned",
        startDate: new Date("2025-03-01"),
        endDate: new Date("2025-08-31"),
        managerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "App Mobile de Vendas",
        description: "Aplicativo mobile para equipe de vendas externa",
        status: "completed",
        startDate: new Date("2024-06-01"),
        endDate: new Date("2024-12-31"),
        managerId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Sistema de Relatórios",
        description:
          "Sistema para geração e visualização de relatórios gerenciais",
        status: "active",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-07-31"),
        managerId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Integração com APIs Externas",
        description: "Desenvolvimento de integrações com sistemas de terceiros",
        status: "planned",
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-09-30"),
        managerId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("projects", projects, {});

    const projectsMembers = [
      {
        projectId: 1,
        userId: 1,
        role: "maintainer",
      },
      {
        projectId: 1,
        userId: 2,
        role: "contributor",
      },
      {
        projectId: 1,
        userId: 3,
        role: "viewer",
      },
    ];

    await queryInterface.bulkInsert("project_members", projectsMembers, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("projects", null, {});
  },
};
