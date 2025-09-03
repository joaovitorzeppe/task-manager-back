import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
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
        createdAt: "2025-09-03T17:27:32.672Z",
        updatedAt: "2025-09-03T17:27:32.672Z",
        deletedAt: null,
      },
    },
  })
  @ApiBadRequestResponse({ description: "Dados inválidos fornecidos" })
  @ApiConflictResponse({ description: "Email já está em uso" })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar todos os usuários" })
  @ApiOkResponse({
    description: "Lista de usuários retornada com sucesso",
    schema: {
      example: [
        {
          id: 1,
          name: "João Silva",
          email: "joao@example.com",
          createdAt: "2025-09-03T17:27:32.672Z",
          updatedAt: "2025-09-03T17:27:32.672Z",
          deletedAt: null,
        },
      ],
    },
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar usuário por ID" })
  @ApiParam({ name: "id", description: "ID do usuário", example: 1 })
  @ApiOkResponse({
    description: "Usuário encontrado com sucesso",
    schema: {
      example: {
        id: 1,
        name: "João Silva",
        email: "joao@example.com",
        createdAt: "2025-09-03T17:27:32.672Z",
        updatedAt: "2025-09-03T17:27:32.672Z",
        deletedAt: null,
      },
    },
  })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  @ApiBadRequestResponse({ description: "ID inválido fornecido" })
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(parseInt(id));
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualizar usuário" })
  @ApiParam({ name: "id", description: "ID do usuário", example: 1 })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: "Usuário atualizado com sucesso",
    schema: {
      example: {
        id: 1,
        name: "João Silva Costa",
        email: "joao@example.com",
        createdAt: "2025-09-03T17:27:32.672Z",
        updatedAt: "2025-09-03T17:29:15.275Z",
        deletedAt: null,
      },
    },
  })
  @ApiBadRequestResponse({ description: "Dados inválidos fornecidos" })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  @ApiConflictResponse({ description: "Email já está em uso" })
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(parseInt(id), updateUserDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remover usuário" })
  @ApiParam({ name: "id", description: "ID do usuário", example: 1 })
  @ApiNoContentResponse({ description: "Usuário removido com sucesso" })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  @ApiBadRequestResponse({ description: "ID inválido fornecido" })
  remove(@Param("id") id: string) {
    return this.usersService.remove(parseInt(id));
  }
}
