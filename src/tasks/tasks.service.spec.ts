import { Test, TestingModule } from "@nestjs/testing";
import { SequelizeModule, getModelToken } from "@nestjs/sequelize";
import { ConfigModule } from "@nestjs/config";
import { TasksService } from "./tasks.service";
import { TasksModule } from "./tasks.module";
import { Task } from "./task.model";
import { TaskComment } from "./task-comment.model";
import { User } from "../users/user.model";
import { Project } from "../projects/project.model";
import { NotFoundException } from "@nestjs/common";
import { ProjectMember } from "../projects/project-member.model";
import { Attachment } from "../projects/attachment.model";

describe("TasksService", () => {
  let service: TasksService;
  let module: TestingModule;
  let taskModel: typeof Task;
  let userModel: typeof User;
  let projectModel: typeof Project;

  const testUser: any = {
    name: "Dev Jest",
    email: "dev.jest@test.com",
    password: "senha123",
    role: "developer",
  };

  const testProject: any = {
    name: "Projeto para Tasks Jest",
    description: "Projeto usado nos testes de TasksService",
    status: "planned",
    startDate: new Date().toISOString(),
  };

  let testUserCreated: User;
  let testProjectCreated: Project;
  let testTaskCreated: Task;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
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
        TasksModule,
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskModel = module.get<typeof Task>(getModelToken(Task));
    userModel = module.get<typeof User>(getModelToken(User));
    projectModel = module.get<typeof Project>(getModelToken(Project));

    testUserCreated = (
      await userModel.findOrCreate({
        where: { email: testUser.email },
        defaults: testUser,
      })
    )[0].toJSON();

    testProject.managerId = testUserCreated.id;
    testProjectCreated = (
      await projectModel.findOrCreate({
        where: { name: testProject.name },
        defaults: testProject,
      })
    )[0].toJSON();
  }, 30000);

  afterAll(async () => {
    try {
      if (testTaskCreated) {
        await taskModel.destroy({
          where: { id: testTaskCreated.id },
          force: true,
        });
      }
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
      if (module) await module.close();
    } catch (e) {
      console.error("Cleanup error:", e);
    }
  }, 30000);

  it("deve ser definido", () => {
    expect(service).toBeDefined();
  });

  it("deve criar uma task com sucesso", async () => {
    const result = await service.create({
      title: "Task Jest",
      description: "Criada via teste",
      status: "todo",
      priority: "medium",
      projectId: testProjectCreated.id,
      assigneeId: testUserCreated.id,
    } as any);

    expect(result).toBeDefined();
    const json = result.toJSON();
    expect(json.id).toBeDefined();
    expect(json.title).toBe("Task Jest");
    expect(json.projectId).toBe(testProjectCreated.id);
    expect(json.assigneeId).toBe(testUserCreated.id);
    testTaskCreated = json;
  });

  it("deve listar tasks e conter a criada", async () => {
    const list = await service.findAll();
    expect(list.length).toBeGreaterThan(0);
    const found = list.find((t) => t.toJSON().id === testTaskCreated.id);
    expect(found).toBeDefined();
  });

  it("deve filtrar tasks por título (LIKE)", async () => {
    const list = await service.findAll({ title: "Jest" } as any);
    expect(list.length).toBeGreaterThan(0);
    const found = list.find((t) => t.toJSON().id === testTaskCreated.id);
    expect(found).toBeDefined();
  });

  it("deve buscar task por ID", async () => {
    const result = await service.findById(testTaskCreated.id);
    expect(result.toJSON().id).toBe(testTaskCreated.id);
  });

  it("deve atualizar task com sucesso", async () => {
    const updated = await service.update(testTaskCreated.id, {
      status: "in_progress",
      priority: "high",
    } as any);
    const json = updated.toJSON();
    expect(json.status).toBe("in_progress");
    expect(json.priority).toBe("high");
  });

  it("deve falhar ao buscar task inexistente", async () => {
    await expect(service.findById(999999)).rejects.toThrow(NotFoundException);
  });

  it("deve remover task com sucesso", async () => {
    await service.remove(testTaskCreated.id);
    await expect(service.findById(testTaskCreated.id)).rejects.toThrow(
      NotFoundException
    );
  });
});
