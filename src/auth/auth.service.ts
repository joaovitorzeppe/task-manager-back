import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "../users/user.model";
import { LoginDto } from "./dto/login.dto";
import { LoginResponseDto } from "./dto/login-response.dto";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  private getExpiresInSeconds(expires: string | number): number {
    if (typeof expires === "number") {
      return expires;
    }
    const match = /^\s*(\d+)\s*(s|m|h|d)?\s*$/i.exec(expires);
    if (!match) {
      return 3600;
    }
    const amount = parseInt(match[1], 10);
    const unit = (match[2] || "s").toLowerCase();
    switch (unit) {
      case "s":
        return amount;
      case "m":
        return amount * 60;
      case "h":
        return amount * 3600;
      case "d":
        return amount * 86400;
      default:
        return amount;
    }
  }

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

    const remember = !!loginDto.rememberMe;
    const configuredExpires =
      this.configService.get<string>("JWT_EXPIRES_IN") || "1h";
    const expiresForSign: string | number = remember ? "7d" : configuredExpires;
    const access_token = this.jwtService.sign(payload, {
      expiresIn: expiresForSign,
    });
    const expires_in = this.getExpiresInSeconds(expiresForSign);

    return {
      access_token,
      token_type: "Bearer",
      expires_in,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
