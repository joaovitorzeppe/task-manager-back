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
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { CurrentUserType } from "../auth/decorators/current-user.decorator";

@ApiTags("users")
@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles("admin")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Criar novo usuário" })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: "Usuário criado com sucesso",
    schema: {
      example: {
        id: 1,
        name: "João Silva",
        email: "joao@example.com",
        role: "admin",
        createdAt: "2025-09-03T17:27:32.672Z",
        updatedAt: "2025-09-03T17:27:32.672Z",
        deletedAt: null,
      },
    },
  })
  @ApiBadRequestResponse({ description: "Dados inválidos fornecidos" })
  @ApiConflictResponse({ description: "Email já está em uso" })
  @ApiForbiddenResponse({ description: "Acesso negado (role insuficiente)" })
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: CurrentUserType
  ) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles("admin")
  @ApiOperation({ summary: "Listar todos os usuários com filtros opcionais" })
  @ApiQuery({
    name: "email",
    description: "Filtrar por email do usuário",
    example: "joao@example.com",
    required: false,
  })
  @ApiQuery({
    name: "role",
    description: "Filtrar por role do usuário",
    example: "admin",
    required: false,
    enum: ["admin", "manager", "developer"],
  })
  @ApiQuery({
    name: "name",
    description: "Filtrar por nome do usuário",
    example: "João Silva",
    required: false,
  })
  @ApiOkResponse({
    description: "Lista de usuários retornada com sucesso",
    schema: {
      example: [
        {
          id: 1,
          name: "João Silva",
          email: "joao@example.com",
          role: "admin",
          createdAt: "2025-09-03T17:27:32.672Z",
          updatedAt: "2025-09-03T17:27:32.672Z",
          deletedAt: null,
        },
      ],
    },
  })
  @ApiForbiddenResponse({ description: "Acesso negado (role insuficiente)" })
  findAll(
    @CurrentUser() currentUser: CurrentUserType,
    @Query("email") email?: string,
    @Query("role") role?: string,
    @Query("name") name?: string
  ) {
    const filters: { email?: string; role?: string; name?: string } = {};
    if (email) filters.email = email;
    if (role) filters.role = role;
    if (name) filters.name = name;

    return this.usersService.findAll(filters);
  }

  @Get(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Buscar usuário por ID" })
  @ApiParam({
    name: "id",
    description: "ID do usuário",
    example: 1,
    type: "number",
  })
  @ApiOkResponse({
    description: "Usuário encontrado com sucesso",
    schema: {
      example: {
        id: 1,
        name: "João Silva",
        email: "joao@example.com",
        role: "admin",
        createdAt: "2025-09-03T17:27:32.672Z",
        updatedAt: "2025-09-03T17:27:32.672Z",
        deletedAt: null,
      },
    },
  })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  @ApiBadRequestResponse({ description: "ID inválido fornecido" })
  @ApiForbiddenResponse({ description: "Acesso negado (role insuficiente)" })
  findById(@Param("id") id: string, @CurrentUser() currentUser: any) {
    return this.usersService.findById(parseInt(id));
  }

  @Put(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Atualizar usuário" })
  @ApiParam({
    name: "id",
    description: "ID do usuário",
    example: 1,
    type: "number",
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: "Usuário atualizado com sucesso",
    schema: {
      example: {
        id: 1,
        name: "João Silva Costa",
        email: "joao@example.com",
        role: "admin",
        createdAt: "2025-09-03T17:27:32.672Z",
        updatedAt: "2025-09-29T17:29:15.275Z",
        deletedAt: null,
      },
    },
  })
  @ApiBadRequestResponse({ description: "Dados inválidos fornecidos" })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  @ApiConflictResponse({ description: "Email já está em uso" })
  @ApiForbiddenResponse({ description: "Acesso negado (role insuficiente)" })
  update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: any
  ) {
    return this.usersService.update(parseInt(id), updateUserDto);
  }

  @Delete(":id")
  @Roles("admin")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remover usuário" })
  @ApiParam({
    name: "id",
    description: "ID do usuário",
    example: 1,
    type: "number",
  })
  @ApiNoContentResponse({ description: "Usuário removido com sucesso" })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  @ApiBadRequestResponse({ description: "ID inválido fornecido" })
  @ApiForbiddenResponse({ description: "Acesso negado (role insuficiente)" })
  remove(@Param("id") id: string, @CurrentUser() currentUser: any) {
    return this.usersService.remove(parseInt(id));
  }
}
