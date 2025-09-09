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
import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadedFile, UseInterceptors } from "@nestjs/common";
import { createMulterOptions } from "../common/upload.config";

class CreateTaskCommentDto {
  @ApiProperty({ description: "Conteúdo HTML do comentário" })
  @IsNotEmpty()
  @IsString()
  content: string;
}

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
  @ApiQuery({
    name: "dueDateFrom",
    description: "Filtrar por dueDate (>=) ISO",
    example: "2025-09-01T00:00:00.000Z",
    required: false,
  })
  @ApiQuery({
    name: "dueDateTo",
    description: "Filtrar por dueDate (<=) ISO",
    example: "2025-09-30T23:59:59.999Z",
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
    @Query("title") title?: string,
    @Query("dueDateFrom") dueDateFrom?: string,
    @Query("dueDateTo") dueDateTo?: string
  ) {
    const filters: {
      status?: string;
      priority?: string;
      projectId?: number;
      projectIds?: number[];
      assigneeId?: number;
      title?: string;
      dueDateFrom?: string;
      dueDateTo?: string;
    } = {};

    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (projectId) filters.projectId = parseInt(projectId);
    if (assigneeId) filters.assigneeId = parseInt(assigneeId);
    if (title) filters.title = title;
    if (dueDateFrom) filters.dueDateFrom = dueDateFrom;
    if (dueDateTo) filters.dueDateTo = dueDateTo;

    if (currentUser.role !== "admin") {
      const allowed = await this.projectMembersService.getProjectIdsForUser(
        currentUser.id
      );
      if (!filters.projectId) {
        filters.projectIds = allowed;
      } else if (!allowed.includes(filters.projectId)) {
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
    const task = (await this.tasksService.findById(parseInt(id))).toJSON();
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

  @Get(":id/comments")
  @ApiOperation({ summary: "Listar comentários de uma tarefa" })
  @ApiOkResponse({ description: "Comentários retornados com sucesso" })
  async listComments(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserType
  ) {
    const task = (await this.tasksService.findById(parseInt(id))).toJSON();
    if (currentUser.role !== "admin") {
      const allowed = await this.projectMembersService.getProjectIdsForUser(
        currentUser.id
      );
      if (!allowed.includes(task.projectId)) {
        throw new ForbiddenException("Acesso negado a esta tarefa");
      }
    }
    return this.tasksService.getComments(task.id);
  }

  @Post(":id/attachments")
  @UseInterceptors(FileInterceptor("file", createMulterOptions("tasks") as any))
  @ApiOperation({ summary: "Enviar anexo para a tarefa" })
  async uploadTaskAttachment(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
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

    if (!file) {
      throw new (require("@nestjs/common").BadRequestException)(
        "Tipo de arquivo não permitido"
      );
    }
    const relative = `/public/uploads/tasks/${file.filename}`;
    return this.tasksService.createAttachmentForTask({
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      url: relative,
      taskId: parseInt(id),
      uploadedById: currentUser.id,
    });
  }

  @Get(":id/attachments")
  @ApiOperation({ summary: "Listar anexos da tarefa" })
  async listTaskAttachments(
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
    return this.tasksService.listAttachmentsForTask(parseInt(id));
  }

  @Delete(":id/attachments/:attachmentId")
  @ApiOperation({ summary: "Excluir anexo da tarefa" })
  async deleteTaskAttachment(
    @Param("id") id: string,
    @Param("attachmentId") attachmentId: string,
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
    await this.tasksService.removeAttachment(parseInt(attachmentId));
    return { success: true };
  }

  @Post(":id/comments")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Criar comentário em uma tarefa" })
  @ApiCreatedResponse({ description: "Comentário criado com sucesso" })
  async createComment(
    @Param("id") id: string,
    @Body() body: CreateTaskCommentDto,
    @CurrentUser() currentUser: CurrentUserType
  ) {
    const task = (await this.tasksService.findById(parseInt(id))).toJSON();
    if (currentUser.role !== "admin") {
      const allowed = await this.projectMembersService.getProjectIdsForUser(
        currentUser.id
      );
      if (!allowed.includes(task.projectId)) {
        throw new ForbiddenException("Acesso negado a esta tarefa");
      }
    }
    return this.tasksService.addComment(task.id, currentUser.id, body.content);
  }

  @Post(":id/comments/:commentId/attachments")
  @UseInterceptors(
    FileInterceptor("file", createMulterOptions("comments") as any)
  )
  @ApiOperation({ summary: "Enviar anexo para um comentário de tarefa" })
  async uploadTaskCommentAttachment(
    @Param("id") id: string,
    @Param("commentId") commentId: string,
    @UploadedFile() file: Express.Multer.File,
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

    const comment = await this.tasksService.findCommentById(
      parseInt(commentId)
    );
    if (!comment || comment.taskId !== task.id) {
      throw new ForbiddenException("Comentário inválido para a tarefa");
    }

    if (!file) {
      throw new (require("@nestjs/common").BadRequestException)(
        "Tipo de arquivo não permitido"
      );
    }
    const relative = `/public/uploads/comments/${file.filename}`;
    return this.tasksService.createAttachmentForComment({
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      url: relative,
      taskCommentId: parseInt(commentId),
      uploadedById: currentUser.id,
    });
  }

  @Get(":id/comments/:commentId/attachments")
  @ApiOperation({ summary: "Listar anexos de um comentário de tarefa" })
  async listTaskCommentAttachments(
    @Param("id") id: string,
    @Param("commentId") commentId: string,
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
    return this.tasksService.listAttachmentsForComment(parseInt(commentId));
  }

  @Delete(":id/comments/:commentId/attachments/:attachmentId")
  @ApiOperation({ summary: "Excluir anexo de um comentário de tarefa" })
  async deleteTaskCommentAttachment(
    @Param("id") id: string,
    @Param("commentId") commentId: string,
    @Param("attachmentId") attachmentId: string,
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
    await this.tasksService.removeAttachment(parseInt(attachmentId));
    return { success: true };
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
      const current = (await this.tasksService.findById(taskId)).toJSON();
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
      const current = (await this.tasksService.findById(taskId)).toJSON();
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
