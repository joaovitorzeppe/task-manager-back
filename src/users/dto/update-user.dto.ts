import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: "Nome completo do usuário",
    example: "João Silva",
    minLength: 2,
    required: false,
  })
  @IsString({ message: "Nome deve ser uma string" })
  @IsOptional({ message: "Nome é opcional" })
  name?: string;

  @ApiProperty({
    description: "Email único do usuário",
    example: "joao@example.com",
    format: "email",
    required: false,
  })
  @IsEmail({}, { message: "Email deve ser válido" })
  @IsOptional({ message: "Email é opcional" })
  email?: string;

  @ApiProperty({
    description: "Senha do usuário (mínimo 6 caracteres)",
    example: "123456",
    minLength: 6,
    required: false,
  })
  @IsString({ message: "Senha deve ser uma string" })
  @IsOptional({ message: "Senha é opcional" })
  @MinLength(6, { message: "Senha deve ter pelo menos 6 caracteres" })
  password?: string;

  @ApiProperty({
    description: "Papel/função do usuário no sistema",
    example: "manager",
    enum: ["admin", "manager", "developer"],
    required: false,
  })
  @IsIn(["admin", "manager", "developer"], {
    message: "Papel/função deve ser um dos valores permitidos",
  })
  @IsOptional({ message: "Papel/função é opcional" })
  role?: "admin" | "manager" | "developer";
}
