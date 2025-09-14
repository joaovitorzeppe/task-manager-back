import { Test, TestingModule } from "@nestjs/testing";
import { SequelizeModule, getModelToken } from "@nestjs/sequelize";
import { ProjectsService } from "./projects.service";
import { ProjectsModule } from "./projects.module";
import { CreateProjectDto } from "./dto/create-project.dto";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Project } from "./project.model";
import { User } from "../users/user.model";
import { UsersModule } from "../users/users.module";
import { Attachment } from "./attachment.model";
import { Task } from "../tasks/task.model";
import { TaskComment } from "../tasks/task-comment.model";
import { ProjectMember } from "./project-member.model";

describe("ProjectsService", () => {
  let service: ProjectsService;
  let module: TestingModule;
  let projectModel: typeof Project;
  let userModel: typeof User;

  const testUser: any = {
    name: "Gerente Jest",
    email: "gerente@test.com",
    password: "senha123",
    role: "manager",
  };

  const testProject: CreateProjectDto = {
    name: "Projeto Jest",
    description: "Projeto de teste para Jest",
    status: "planned",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    managerId: testUser.id,
  };

  let testUserCreated: User;
  let testProjectCreated: Project;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        SequelizeModule.forRoot({
          dialect: "postgres",
          host: process.env.DB_HOST || "localhost",
          port: parseInt(process.env.DB_PORT || "5432"),
          username: process.env.DB_USERNAME || "postgres",
          password: process.env.DB_PASSWORD || "postgres",
          database: process.env.DB_NAME || "optidata",
          autoLoadModels: true,
          synchronize: false,
          logging: false,
          models: [Project, User, Attachment, ProjectMember, Task, TaskComment],
        }),
        ProjectsModule,
        UsersModule,
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    projectModel = module.get<typeof Project>(getModelToken(Project));
    userModel = module.get<typeof User>(getModelToken(User));
  }, 30000);

  afterAll(async () => {
    try {
      if (testProjectCreated) {
        await projectModel.destroy({
          where: { id: testProjectCreated.id },
          force: true,
        });
      }

      if (testUserCreated) {
        await userModel.destroy({
          where: { id: testUserCreated.id },
          force: true,
        });
      }

      if (module) {
        await module.close();
      }
    } catch (error) {
      console.error("Erro durante cleanup:", error);
    }
  }, 30000);

  it("deve ser definido", () => {
    expect(service).toBeDefined();
  });

  it("deve criar um projeto com sucesso", async () => {
    testUserCreated = (
      await userModel.findOrCreate({
        where: { email: testUser.email },
        defaults: testUser,
      })
    )[0].toJSON();
    testProject.managerId = testUserCreated.id;

    const result = await service.create(testProject);
    const newProject = result.toJSON();

    expect(result).toBeDefined();
    expect(newProject.id).toBeDefined();
    expect(newProject.name).toBe(testProject.name);
    expect(newProject.description).toBe(testProject.description);
    expect(newProject.status).toBe(testProject.status);
    expect(newProject.managerId).toBe(testProject.managerId);
    expect(newProject.startDate).toBeDefined();
    expect(newProject.endDate).toBeDefined();
    expect(newProject.manager).toBeDefined();
    expect(newProject.manager.id).toBe(testUserCreated.id);
    expect(newProject.manager.name).toBe(testUserCreated.name);
    expect(newProject.manager.role).toBe(testUserCreated.role);

    testProjectCreated = newProject;
  });

  it("deve falhar ao tentar criar projeto com gerente inexistente", async () => {
    const invalidProject = { ...testProject, managerId: 9999 };
    await expect(service.create(invalidProject)).rejects.toThrow(
      NotFoundException
    );
  });

  it("deve falhar ao tentar criar projeto com usuário que não é gerente", async () => {
    const developerUser = await userModel.create({
      name: "Developer Jest",
      email: "developer@test.com",
      password: "senha123",
      role: "developer",
    } as any);

    const invalidProject = { ...testProject, managerId: developerUser.id };
    await expect(service.create(invalidProject)).rejects.toThrow(
      BadRequestException
    );

    await userModel.destroy({
      where: { id: developerUser.id },
      force: true,
    });
  });

  it("deve falhar ao tentar criar projeto com data de término anterior à data de início", async () => {
    const invalidProject = {
      ...testProject,
      startDate: "2025-12-31",
      endDate: "2025-01-01",
    };
    await expect(service.create(invalidProject)).rejects.toThrow(
      BadRequestException
    );
  });

  it("deve listar todos os projetos", async () => {
    const result = await service.findAll();
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);

    const testProjectFound = result.find(
      (project) => project.toJSON().id === testProjectCreated.id
    );
    expect(testProjectFound).toBeDefined();
  });

  it("deve listar projetos com filtro por nome", async () => {
    const result = await service.findAll({ name: "Jest" });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);

    const testProjectFound = result.find(
      (project) => project.toJSON().id === testProjectCreated.id
    );
    expect(testProjectFound).toBeDefined();
  });

  it("deve listar projetos com filtro por status", async () => {
    const result = await service.findAll({ status: ["planned"] });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);

    const testProjectFound = result.find(
      (project) => project.toJSON().id === testProjectCreated.id
    );
    expect(testProjectFound).toBeDefined();
  });

  it("deve listar projetos com filtro por gerente", async () => {
    const result = await service.findAll({ managerId: testUserCreated.id });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);

    const testProjectFound = result.find(
      (project) => project.toJSON().id === testProjectCreated.id
    );
    expect(testProjectFound).toBeDefined();
  });

  it("deve buscar um projeto por ID", async () => {
    const result = await service.findById(testProjectCreated.id);
    const foundProject = result.toJSON();

    expect(result).toBeDefined();
    expect(foundProject.id).toBe(testProjectCreated.id);
    expect(foundProject.name).toBe(testProjectCreated.name);
    expect(foundProject.description).toBe(testProjectCreated.description);
    expect(foundProject.status).toBe(testProjectCreated.status);
    expect(foundProject.managerId).toBe(testProjectCreated.managerId);
    expect(foundProject.manager).toBeDefined();
  });

  it("deve falhar ao tentar buscar um projeto por ID inexistente", async () => {
    await expect(service.findById(9999)).rejects.toThrow(NotFoundException);
  });

  it("deve atualizar um projeto com sucesso", async () => {
    const updateData = {
      name: "Projeto Jest Atualizado",
      status: "active" as const,
    };

    const result = await service.update(testProjectCreated.id, updateData);
    const updatedProject = result.toJSON();

    expect(result).toBeDefined();
    expect(updatedProject.id).toBe(testProjectCreated.id);
    expect(updatedProject.name).toBe("Projeto Jest Atualizado");
    expect(updatedProject.status).toBe("active");
    expect(updatedProject.description).toBe(testProjectCreated.description);
    expect(updatedProject.managerId).toBe(testProjectCreated.managerId);
  });

  it("deve falhar ao tentar atualizar um projeto inexistente", async () => {
    await expect(
      service.update(9999, { name: "Projeto Inexistente" })
    ).rejects.toThrow(NotFoundException);
  });

  it("deve falhar ao tentar atualizar projeto com gerente inexistente", async () => {
    await expect(
      service.update(testProjectCreated.id, { managerId: 9999 })
    ).rejects.toThrow(NotFoundException);
  });

  it("deve falhar ao tentar atualizar projeto com usuário que não é gerente", async () => {
    const developerUser = await userModel.create({
      name: "Developer Jest 2",
      email: "developer2@test.com",
      password: "senha123",
      role: "developer",
    } as any);

    await expect(
      service.update(testProjectCreated.id, { managerId: developerUser.id })
    ).rejects.toThrow(BadRequestException);

    await userModel.destroy({
      where: { id: developerUser.id },
      force: true,
    });
  });

  it("deve falhar ao tentar atualizar projeto com data de término anterior à data de início", async () => {
    await expect(
      service.update(testProjectCreated.id, {
        startDate: "2025-12-31",
        endDate: "2025-01-01",
      })
    ).rejects.toThrow(BadRequestException);
  });

  it("deve remover um projeto com sucesso", async () => {
    await service.remove(testProjectCreated.id);
    await expect(service.findById(testProjectCreated.id)).rejects.toThrow(
      NotFoundException
    );
  });

  it("deve falhar ao tentar remover um projeto inexistente", async () => {
    await expect(service.remove(9999)).rejects.toThrow(NotFoundException);
  });
});
