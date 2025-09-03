import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { LoginResponseDto } from "./dto/login-response.dto";

@ApiTags("Autenticação")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Realizar login do usuário" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: "Login realizado com sucesso",
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Credenciais inválidas",
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }
}
