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
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Senha do usuário (mínimo 6 caracteres)",
    example: "123456",
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: "Papel/função do usuário no sistema",
    example: "developer",
    enum: ["admin", "manager", "developer"],
    default: "developer",
  })
  @IsNotEmpty()
  @IsIn(["admin", "manager", "developer"])
  role: "admin" | "manager" | "developer";
}
