import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: "Nome completo do usuário",
    example: "João Silva",
    minLength: 2,
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: "Email único do usuário",
    example: "joao@example.com",
    format: "email",
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: "Senha do usuário (mínimo 6 caracteres)",
    example: "123456",
    minLength: 6,
    required: false,
  })
  password?: string;
}
