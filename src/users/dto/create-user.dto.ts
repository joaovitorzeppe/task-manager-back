import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsIn,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({
    description: "Nome completo do usuário",
    example: "João Silva",
    minLength: 2,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: "Email único do usuário",
    example: "joao@example.com",
    format: "email",
  })
  @IsNotEmpty()
  @IsEmail({}, { message: "Email deve ser válido" })
  email: string;

  @ApiProperty({
    description: "Senha do usuário (mínimo 6 caracteres)",
    example: "123456",
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString({ message: "Senha deve ser uma string" })
  @MinLength(6, { message: "Senha deve ter pelo menos 6 caracteres" })
  password: string;

  @ApiProperty({
    description: "Papel/função do usuário no sistema",
    example: "developer",
    enum: ["admin", "manager", "developer"],
    default: "developer",
  })
  @IsNotEmpty()
  @IsIn(["admin", "manager", "developer"], {
    message: "Papel/função deve ser um dos valores permitidos",
  })
  role: "admin" | "manager" | "developer";
}
