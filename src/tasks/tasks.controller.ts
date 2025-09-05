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
  ForbiddenException,
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
  ApiForbiddenResponse,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { TasksService } from "./tasks.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { CurrentUserType } from "../auth/decorators/current-user.decorator";
import { ProjectMembersService } from "../projects/project-members.service";

@ApiTags("tasks")
@Controller("tasks")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly projectMembersService: ProjectMembersService
  ) {}

  @Post()
  @Roles("admin", "manager")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Criar nova tarefa",
    description: "Roles permitidos: admin, manager",
  })
  @ApiBody({ type: CreateTaskDto })
  @ApiCreatedResponse({
    description: "Tarefa criada com sucesso",
    schema: {
      example: {
        id: 1,
        title: "Implementar autenticação",
        description: "Criar sistema de login e autorização com JWT",
        status: "todo",
        priority: "high",
        dueDate: "2024-01-25T00:00:00.000Z",
        projectId: 1,
        assigneeId: 3,
        createdAt: "2025-09-03T17:27:32.672Z",
        updatedAt: "2025-09-03T17:27:32.672Z",
        deletedAt: null,
      },
    },
  })
  @ApiForbiddenResponse({ description: "Acesso negado (role insuficiente)" })
  @ApiBadRequestResponse({ description: "Dados inválidos fornecidos" })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() currentUser: CurrentUserType
  ) {
    if (currentUser.role !== "admin") {
      const allowed = await this.projectMembersService.getProjectIdsForUser(
        currentUser.id
      );
      if (!allowed.includes(createTaskDto.projectId)) {
        throw new ForbiddenException("Acesso negado ao projeto informado");
      }
    }
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar todas as tarefas com filtros opcionais" })
  @ApiQuery({
    name: "status",
    description: "Filtrar por status da tarefa",
    example: "todo",
    required: false,
    enum: ["todo", "in_progress", "review", "done"],
  })
  @ApiQuery({
    name: "priority",
    description: "Filtrar por prioridade da tarefa",
    example: "high",
    required: false,
    enum: ["low", "medium", "high", "critical"],
  })
  @ApiQuery({
    name: "projectId",
    description: "Filtrar por ID do projeto",
    example: 1,
    required: false,
    type: "number",
  })
  @ApiQuery({
    name: "assigneeId",
    description: "Filtrar por ID do responsável",
    example: 3,
    required: false,
    type: "number",
  })
  @ApiQuery({
    name: "title",
    description: "Filtrar por título da tarefa",
    example: "Implementar",
    required: false,
  })
  @ApiOkResponse({
    description: "Lista de tarefas retornada com sucesso",
  })
  async findAll(
    @CurrentUser() currentUser: CurrentUserType,
    @Query("status") status?: string,
    @Query("priority") priority?: string,
    @Query("projectId") projectId?: string,
    @Query("assigneeId") assigneeId?: string,
    @Query("title") title?: string
  ) {
    const filters: {
      status?: string;
      priority?: string;
      projectId?: number;
      projectIds?: number[];
      assigneeId?: number;
      title?: string;
    } = {};

    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (projectId) filters.projectId = parseInt(projectId);
    if (assigneeId) filters.assigneeId = parseInt(assigneeId);
    if (title) filters.title = title;

    // Access scoping: non-admin users only see tasks from their projects
    if (currentUser.role !== "admin") {
      const allowed = await this.projectMembersService.getProjectIdsForUser(
        currentUser.id
      );
      if (!filters.projectId) {
        filters.projectIds = allowed;
      } else if (!allowed.includes(filters.projectId)) {
        // force empty result if requesting a project they don't belong to
        filters.projectIds = [-1];
      }
    }

    return this.tasksService.findAll(filters);
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar tarefa por ID" })
  @ApiParam({
    name: "id",
    description: "ID da tarefa",
    example: 1,
    type: "number",
  })
  @ApiOkResponse({
    description: "Tarefa encontrada com sucesso",
  })
  @ApiNotFoundResponse({ description: "Tarefa não encontrada" })
  @ApiBadRequestResponse({ description: "ID inválido fornecido" })
  async findById(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserType
  ) {
    const task = await this.tasksService.findById(parseInt(id));
    if (currentUser.role !== "admin") {
      const allowed = await this.projectMembersService.getProjectIdsForUser(
        currentUser.id
      );
      if (!allowed.includes(task.projectId)) {
        throw new ForbiddenException("Acesso negado a esta tarefa");
      }
    }
    return task;
  }

  @Put(":id")
  @ApiOperation({
    summary: "Atualizar tarefa",
    description: "Roles permitidos: admin, manager",
  })
  @ApiParam({
    name: "id",
    description: "ID da tarefa",
    example: 1,
    type: "number",
  })
  @ApiBody({ type: UpdateTaskDto })
  @ApiOkResponse({
    description: "Tarefa atualizada com sucesso",
  })
  @ApiForbiddenResponse({ description: "Acesso negado (role insuficiente)" })
  @ApiBadRequestResponse({ description: "Dados inválidos fornecidos" })
  @ApiNotFoundResponse({ description: "Tarefa não encontrada" })
  async update(
    @Param("id") id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() currentUser: CurrentUserType
  ) {
    const taskId = parseInt(id);
    if (currentUser.role !== "admin") {
      const current = await this.tasksService.findById(taskId);
      const allowed = await this.projectMembersService.getProjectIdsForUser(
        currentUser.id
      );
      const targetProjectId = updateTaskDto.projectId ?? current.projectId;
      if (!allowed.includes(targetProjectId)) {
        throw new ForbiddenException("Acesso negado ao projeto informado");
      }
    }
    return this.tasksService.update(taskId, updateTaskDto);
  }

  @Delete(":id")
  @Roles("admin", "manager")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Remover tarefa",
    description: "Roles permitidos: admin, manager",
  })
  @ApiParam({
    name: "id",
    description: "ID da tarefa",
    example: 1,
    type: "number",
  })
  @ApiNoContentResponse({ description: "Tarefa removida com sucesso" })
  @ApiForbiddenResponse({ description: "Acesso negado (role insuficiente)" })
  @ApiNotFoundResponse({ description: "Tarefa não encontrada" })
  @ApiBadRequestResponse({ description: "ID inválido fornecido" })
  async remove(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserType
  ) {
    const taskId = parseInt(id);
    if (currentUser.role !== "admin") {
      const current = await this.tasksService.findById(taskId);
      const allowed = await this.projectMembersService.getProjectIdsForUser(
        currentUser.id
      );
      if (!allowed.includes(current.projectId)) {
        throw new ForbiddenException("Acesso negado a esta tarefa");
      }
    }
    return this.tasksService.remove(taskId);
  }
}
