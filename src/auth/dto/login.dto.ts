import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsBoolean,
  IsOptional,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({
    description: "Email do usuário",
    example: "joao@example.com",
  })
  @IsEmail({}, { message: "Email deve ser válido" })
  @IsNotEmpty({ message: "Email é obrigatório" })
  email: string;

  @ApiProperty({
    description: "Senha do usuário",
    example: "123456",
    minLength: 6,
  })
  @IsString({ message: "Senha deve ser uma string" })
  @IsNotEmpty({ message: "Senha é obrigatória" })
  @MinLength(6, { message: "Senha deve ter pelo menos 6 caracteres" })
  password: string;

  @ApiPropertyOptional({
    description: "Se verdadeiro, define expiração do token para 7 dias",
    example: true,
  })
  @IsBoolean({ message: "rememberMe deve ser um booleano" })
  @IsOptional()
  rememberMe?: boolean;
}
