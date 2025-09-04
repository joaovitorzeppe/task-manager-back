import { Test, TestingModule } from "@nestjs/testing";
import { SequelizeModule, getModelToken } from "@nestjs/sequelize";
import { UsersService } from "./users.service";
import { UsersModule } from "./users.module";
import { CreateUserDto } from "./dto/create-user.dto";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { User } from "./user.model";
import { Project } from "../projects/project.model";

describe("UsersService", () => {
  let service: UsersService;
  let module: TestingModule;
  let userModel: typeof User;

  const testUser: CreateUserDto = {
    name: "Usuário Jest",
    email: "jest@test.com",
    password: "senha123",
    role: "admin",
  };

  let testUserCreated: User;

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
          models: [User, Project],
        }),
        UsersModule,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<typeof User>(getModelToken(User));
  }, 30000);

  afterAll(async () => {
    try {
      if (userModel) {
        await userModel.destroy({
          where: {
            email: "jest@test.com",
          },
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

  it("deve criar um usuário com sucesso", async () => {
    const result = await service.create(testUser);
    const newUser = result.toJSON();

    expect(result).toBeDefined();
    expect(newUser.id).toBeDefined();
    expect(newUser.name).toBe(testUser.name);
    expect(newUser.email).toBe(testUser.email);
    expect(newUser.role).toBe(testUser.role);
    expect(newUser.password).not.toBe(testUser.password);

    testUserCreated = newUser;
  });

  it("deve falhar ao tentar criar usuário com email já existente", async () => {
    await expect(service.create(testUser)).rejects.toThrow(ConflictException);
  });

  it("deve listar todos os usuários", async () => {
    const result = await service.findAll();
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    const testUser = result.find(
      (user) => user.toJSON().email === testUserCreated.email
    );
    expect(testUser).toBeDefined();
  });

  it("deve buscar um usuário por ID", async () => {
    const result = await service.findById(testUserCreated.id);
    const foundUser = result.toJSON();
    expect(result).toBeDefined();
    expect(foundUser.id).toBe(testUserCreated.id);
    expect(foundUser.name).toBe(testUserCreated.name);
    expect(foundUser.email).toBe(testUserCreated.email);
    expect(foundUser.role).toBe(testUserCreated.role);
    expect(foundUser.password).not.toBe(testUserCreated.password);
  });

  it("deve falhar ao tentar buscar um usuário por ID inexistente", async () => {
    await expect(service.findById(9999)).rejects.toThrow(NotFoundException);
  });

  it("deve atualizar um usuário com sucesso", async () => {
    const result = await service.update(testUserCreated.id, {
      name: "Usuário Jest Atualizado",
    });
    const updatedUser = result.toJSON();
    expect(result).toBeDefined();
    expect(updatedUser.id).toBe(testUserCreated.id);
    expect(updatedUser.name).toBe("Usuário Jest Atualizado");
    expect(updatedUser.email).toBe(testUserCreated.email);
    expect(updatedUser.role).toBe(testUserCreated.role);
    expect(updatedUser.password).not.toBe(testUserCreated.password);
  });

  it("deve falhar ao tentar atualizar um usuário com email já existente", async () => {
    await expect(
      service.update(testUserCreated.id, {
        email: "jest@test.com",
      })
    ).rejects.toThrow(ConflictException);
  });

  it("deve remover um usuário com sucesso", async () => {
    await service.remove(testUserCreated.id);
    await expect(service.findById(testUserCreated.id)).rejects.toThrow(
      NotFoundException
    );
  });

  it("deve falhar ao tentar remover um usuário inexistente", async () => {
    await expect(service.remove(9999)).rejects.toThrow(NotFoundException);
  });
});
