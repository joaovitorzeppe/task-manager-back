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
  ApiForbiddenResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { CurrentUserType } from "../auth/decorators/current-user.decorator";
import { AddProjectMemberDto } from "./dto/add-project-member.dto";
import { UpdateProjectMemberDto } from "./dto/update-project-member.dto";
import { ProjectMembersService } from "./project-members.service";
import {
  ForbiddenException,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { createMulterOptions } from "../common/upload.config";
import { Attachment } from "./attachment.model";

@ApiTags("projects")
@Controller("projects")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectMembersService: ProjectMembersService
  ) {}

  @Post()
  @Roles("admin", "manager")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Criar novo projeto",
    description: "Roles permitidos: admin, manager",
  })
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
          email: "joao@exemplo.com",
          role: "manager",
        },
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
        deletedAt: null,
      },
    },
  })
  @ApiForbiddenResponse({ description: "Acesso negado (role insuficiente)" })
  @ApiBadRequestResponse({ description: "Dados inválidos fornecidos" })
  @ApiNotFoundResponse({ description: "Gerente não encontrado" })
  create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser() currentUser: CurrentUserType
  ) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @Roles("admin", "manager")
  @ApiOperation({
    summary: "Listar todos os projetos com filtros opcionais",
    description: "Roles permitidos: admin, manager",
  })
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
            email: "joao@exemplo.com",
            role: "manager",
          },
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
          deletedAt: null,
        },
      ],
    },
  })
  @ApiForbiddenResponse({ description: "Acesso negado (role insuficiente)" })
  async findAll(
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

    if (currentUser.role !== "admin") {
      const allowedIds = await this.projectMembersService.getProjectIdsForUser(
        currentUser.id
      );
      if (allowedIds.length === 0) {
        return [];
      }
      const all = await this.projectsService.findAll(filters);
      return all.filter((p) => allowedIds.includes(p.id));
    }

    return this.projectsService.findAll(filters);
  }

  @Get(":id")
  @Roles("admin", "manager")
  @ApiOperation({
    summary: "Buscar projeto por ID",
    description: "Roles permitidos: admin, manager",
  })
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
          email: "joao@exemplo.com",
          role: "manager",
        },
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
        deletedAt: null,
      },
    },
  })
  @ApiForbiddenResponse({ description: "Acesso negado (role insuficiente)" })
  @ApiNotFoundResponse({ description: "Projeto não encontrado" })
  @ApiBadRequestResponse({ description: "ID inválido fornecido" })
  findById(@Param("id") id: string, @CurrentUser() currentUser: any) {
    return this.projectsService.findById(parseInt(id));
  }

  @Put(":id")
  @Roles("admin", "manager")
  @ApiOperation({
    summary: "Atualizar projeto",
    description: "Roles permitidos: admin, manager",
  })
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
          email: "joao@exemplo.com",
          role: "manager",
        },
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
        deletedAt: null,
      },
    },
  })
  @ApiForbiddenResponse({ description: "Acesso negado (role insuficiente)" })
  @ApiBadRequestResponse({ description: "Dados inválidos fornecidos" })
  @ApiNotFoundResponse({ description: "Projeto não encontrado" })
  async update(
    @Param("id") id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() currentUser: any
  ) {
    if (currentUser.role !== "admin") {
      const allowed = await this.projectMembersService.getProjectIdsForUser(
        currentUser.id
      );
      if (!allowed.includes(parseInt(id))) {
        throw new ForbiddenException("Acesso negado ao projeto");
      }
    }
    return this.projectsService.update(parseInt(id), updateProjectDto);
  }

  @Delete(":id")
  @Roles("admin", "manager")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Remover projeto",
    description: "Roles permitidos: admin, manager",
  })
  @ApiParam({
    name: "id",
    description: "ID do projeto",
    example: 1,
    type: "number",
  })
  @ApiNoContentResponse({ description: "Projeto removido com sucesso" })
  @ApiForbiddenResponse({ description: "Acesso negado (role insuficiente)" })
  @ApiNotFoundResponse({ description: "Projeto não encontrado" })
  @ApiBadRequestResponse({ description: "ID inválido fornecido" })
  async remove(@Param("id") id: string, @CurrentUser() currentUser: any) {
    if (currentUser.role !== "admin") {
      const allowed = await this.projectMembersService.getProjectIdsForUser(
        currentUser.id
      );
      if (!allowed.includes(parseInt(id))) {
        throw new ForbiddenException("Acesso negado ao projeto");
      }
    }
    return this.projectsService.remove(parseInt(id));
  }

  @Post(":id/members")
  @Roles("admin", "manager")
  @ApiOperation({ summary: "Adicionar membro ao projeto" })
  async addMember(
    @Param("id") id: string,
    @Body() body: AddProjectMemberDto,
    @CurrentUser() currentUser: CurrentUserType
  ) {
    if (currentUser.role !== "admin") {
      const allowed = await this.projectMembersService.getProjectIdsForUser(
        currentUser.id
      );
      if (!allowed.includes(parseInt(id))) {
        throw new ForbiddenException("Acesso negado ao projeto");
      }
    }
    return this.projectsService.addMember(parseInt(id), body);
  }

  @Put(":id/members/:memberId")
  @Roles("admin", "manager")
  @ApiOperation({ summary: "Atualizar papel de um membro do projeto" })
  async updateMember(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @Body() body: UpdateProjectMemberDto,
    @CurrentUser() currentUser: CurrentUserType
  ) {
    if (currentUser.role !== "admin") {
      const allowed = await this.projectMembersService.getProjectIdsForUser(
        currentUser.id
      );
      if (!allowed.includes(parseInt(id))) {
        throw new ForbiddenException("Acesso negado ao projeto");
      }
    }
    return this.projectsService.updateMember(
      parseInt(id),
      parseInt(memberId),
      body
    );
  }

  @Delete(":id/members/:memberId")
  @Roles("admin", "manager")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remover membro do projeto" })
  async removeMember(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @CurrentUser() currentUser: CurrentUserType
  ) {
    if (currentUser.role !== "admin") {
      const allowed = await this.projectMembersService.getProjectIdsForUser(
        currentUser.id
      );
      if (!allowed.includes(parseInt(id))) {
        throw new ForbiddenException("Acesso negado ao projeto");
      }
    }
    return this.projectsService.removeMember(parseInt(id), parseInt(memberId));
  }

  @Post(":id/attachments")
  @Roles("admin", "manager", "developer")
  @UseInterceptors(
    FileInterceptor("file", createMulterOptions("projects") as any)
  )
  @ApiOperation({ summary: "Enviar anexo para o projeto" })
  async uploadProjectAttachment(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: CurrentUserType
  ) {
    if (currentUser.role !== "admin") {
      const allowed = await this.projectMembersService.getProjectIdsForUser(
        currentUser.id
      );
      if (!allowed.includes(parseInt(id))) {
        throw new ForbiddenException("Acesso negado ao projeto");
      }
    }

    if (!file) {
      throw new (require("@nestjs/common").BadRequestException)(
        "Tipo de arquivo não permitido"
      );
    }
    const relative = `/public/uploads/projects/${file.filename}`;
    const attachment = (await this.projectsService.createAttachment({
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      url: relative,
      projectId: parseInt(id),
      uploadedById: currentUser.id,
    })) as Attachment;

    return attachment;
  }

  @Get(":id/attachments")
  @Roles("admin", "manager", "developer")
  @ApiOperation({ summary: "Listar anexos do projeto" })
  async listProjectAttachments(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserType
  ) {
    if (currentUser.role !== "admin") {
      const allowed = await this.projectMembersService.getProjectIdsForUser(
        currentUser.id
      );
      if (!allowed.includes(parseInt(id))) {
        throw new ForbiddenException("Acesso negado ao projeto");
      }
    }
    return this.projectsService.listAttachments({ projectId: parseInt(id) });
  }

  @Delete(":id/attachments/:attachmentId")
  @Roles("admin", "manager", "developer")
  @ApiOperation({ summary: "Excluir anexo do projeto" })
  async deleteProjectAttachment(
    @Param("id") id: string,
    @Param("attachmentId") attachmentId: string,
    @CurrentUser() currentUser: CurrentUserType
  ) {
    if (currentUser.role !== "admin") {
      const allowed = await this.projectMembersService.getProjectIdsForUser(
        currentUser.id
      );
      if (!allowed.includes(parseInt(id))) {
        throw new ForbiddenException("Acesso negado ao projeto");
      }
    }
    await this.projectsService.removeAttachment(parseInt(attachmentId));
    return { success: true };
  }
}
