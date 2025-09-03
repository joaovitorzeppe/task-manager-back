import { ApiProperty } from "@nestjs/swagger";

export class LoginResponseDto {
  @ApiProperty({
    description: "Token JWT de acesso",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  access_token: string;

  @ApiProperty({
    description: "Tipo do token",
    example: "Bearer",
  })
  token_type: string;

  @ApiProperty({
    description: "Tempo de expiração em segundos",
    example: 3600,
  })
  expires_in: number;

  @ApiProperty({
    description: "Informações do usuário logado",
  })
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}
