import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "../users/user.model";
import { LoginDto } from "./dto/login.dto";
import { LoginResponseDto } from "./dto/login-response.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.get("password")))) {
      const { password: _, ...result } = user.toJSON();
      return result as User;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      token_type: "Bearer",
      expires_in: 3600, // 1 hora
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
