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
import { TasksService } from "./tasks.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { CurrentUserType } from "../auth/decorators/current-user.decorator";

@ApiTags("tasks")
@Controller("tasks")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Criar nova tarefa" })
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
  @ApiBadRequestResponse({ description: "Dados inválidos fornecidos" })
  create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() currentUser: CurrentUserType
  ) {
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
  findAll(
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
      assigneeId?: number;
      title?: string;
    } = {};

    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (projectId) filters.projectId = parseInt(projectId);
    if (assigneeId) filters.assigneeId = parseInt(assigneeId);
    if (title) filters.title = title;

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
  findById(@Param("id") id: string, @CurrentUser() currentUser: any) {
    return this.tasksService.findById(parseInt(id));
  }

  @Put(":id")
  @ApiOperation({ summary: "Atualizar tarefa" })
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
  @ApiBadRequestResponse({ description: "Dados inválidos fornecidos" })
  @ApiNotFoundResponse({ description: "Tarefa não encontrada" })
  update(
    @Param("id") id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() currentUser: any
  ) {
    return this.tasksService.update(parseInt(id), updateTaskDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remover tarefa" })
  @ApiParam({
    name: "id",
    description: "ID da tarefa",
    example: 1,
    type: "number",
  })
  @ApiNoContentResponse({ description: "Tarefa removida com sucesso" })
  @ApiNotFoundResponse({ description: "Tarefa não encontrada" })
  @ApiBadRequestResponse({ description: "ID inválido fornecido" })
  remove(@Param("id") id: string, @CurrentUser() currentUser: any) {
    return this.tasksService.remove(parseInt(id));
  }
}
