import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { CurrentUserType } from "../auth/decorators/current-user.decorator";

@ApiTags("projects")
@Controller("projects")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Criar novo projeto" })
  @ApiBody({ type: CreateProjectDto })
  @ApiCreatedResponse({
    description: "Projeto criado com sucesso",
    schema: {
      example: {
        id: 1,
        name: "Sistema de Gestão de Projetos",
        description: "Sistema completo para gestão de projetos e tarefas",
        status: "planned",
        startDate: "2025-01-01T00:00:00.000Z",
        endDate: "2025-12-31T00:00:00.000Z",
        managerId: 1,
        manager: {
          id: 1,
          name: "João Silva",
          email: "joao@example.com",
          role: "manager",
        },
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
        deletedAt: null,
      },
    },
  })
  @ApiBadRequestResponse({ description: "Dados inválidos fornecidos" })
  @ApiNotFoundResponse({ description: "Gerente não encontrado" })
  create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser() currentUser: CurrentUserType
  ) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar todos os projetos com filtros opcionais" })
  @ApiQuery({
    name: "name",
    description: "Filtrar por nome do projeto",
    example: "Sistema de Gestão",
    required: false,
  })
  @ApiQuery({
    name: "status",
    description: "Filtrar por status do projeto",
    example: "active",
    required: false,
    enum: ["planned", "active", "completed", "cancelled"],
  })
  @ApiQuery({
    name: "managerId",
    description: "Filtrar por ID do gerente",
    example: 1,
    required: false,
    type: "number",
  })
  @ApiOkResponse({
    description: "Lista de projetos retornada com sucesso",
    schema: {
      example: [
        {
          id: 1,
          name: "Sistema de Gestão de Projetos",
          description: "Sistema completo para gestão de projetos e tarefas",
          status: "active",
          startDate: "2025-01-01T00:00:00.000Z",
          endDate: "2025-12-31T00:00:00.000Z",
          managerId: 1,
          manager: {
            id: 1,
            name: "João Silva",
            email: "joao@example.com",
            role: "manager",
          },
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
          deletedAt: null,
        },
      ],
    },
  })
  findAll(
    @CurrentUser() currentUser: CurrentUserType,
    @Query("name") name?: string,
    @Query("status") status?: string,
    @Query("managerId") managerId?: string
  ) {
    const filters: { name?: string; status?: string[]; managerId?: number } =
      {};
    if (name) filters.name = name;
    if (status) filters.status = status.split(",");
    if (managerId) filters.managerId = parseInt(managerId);

    return this.projectsService.findAll(filters);
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar projeto por ID" })
  @ApiParam({
    name: "id",
    description: "ID do projeto",
    example: 1,
    type: "number",
  })
  @ApiOkResponse({
    description: "Projeto encontrado com sucesso",
    schema: {
      example: {
        id: 1,
        name: "Sistema de Gestão de Projetos",
        description: "Sistema completo para gestão de projetos e tarefas",
        status: "active",
        startDate: "2025-01-01T00:00:00.000Z",
        endDate: "2025-12-31T00:00:00.000Z",
        managerId: 1,
        manager: {
          id: 1,
          name: "João Silva",
          email: "joao@example.com",
          role: "manager",
        },
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
        deletedAt: null,
      },
    },
  })
  @ApiNotFoundResponse({ description: "Projeto não encontrado" })
  @ApiBadRequestResponse({ description: "ID inválido fornecido" })
  findById(@Param("id") id: string, @CurrentUser() currentUser: any) {
    return this.projectsService.findById(parseInt(id));
  }

  @Put(":id")
  @ApiOperation({ summary: "Atualizar projeto" })
  @ApiParam({
    name: "id",
    description: "ID do projeto",
    example: 1,
    type: "number",
  })
  @ApiBody({ type: UpdateProjectDto })
  @ApiOkResponse({
    description: "Projeto atualizado com sucesso",
    schema: {
      example: {
        id: 1,
        name: "Sistema de Gestão de Projetos Atualizado",
        description: "Sistema completo para gestão de projetos e tarefas",
        status: "active",
        startDate: "2025-01-01T00:00:00.000Z",
        endDate: "2025-12-31T00:00:00.000Z",
        managerId: 1,
        manager: {
          id: 1,
          name: "João Silva",
          email: "joao@example.com",
          role: "manager",
        },
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
        deletedAt: null,
      },
    },
  })
  @ApiBadRequestResponse({ description: "Dados inválidos fornecidos" })
  @ApiNotFoundResponse({ description: "Projeto não encontrado" })
  update(
    @Param("id") id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() currentUser: any
  ) {
    return this.projectsService.update(parseInt(id), updateProjectDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remover projeto" })
  @ApiParam({
    name: "id",
    description: "ID do projeto",
    example: 1,
    type: "number",
  })
  @ApiNoContentResponse({ description: "Projeto removido com sucesso" })
  @ApiNotFoundResponse({ description: "Projeto não encontrado" })
  @ApiBadRequestResponse({ description: "ID inválido fornecido" })
  remove(@Param("id") id: string, @CurrentUser() currentUser: any) {
    return this.projectsService.remove(parseInt(id));
  }
}
