import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./user.model";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";
import { Op } from "sequelize";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User
  ) {}

  async create(body: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      where: { email: body.email },
    });

    if (existingUser) {
      throw new ConflictException("Email já está em uso");
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await this.userModel.create({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: body.role,
    } as User);

    return user;
  }

  async findAll(options?: {
    email?: string;
    role?: string;
    name?: string;
  }): Promise<User[]> {
    const where: any = {};
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value) {
          where[key] = { [Op.iLike]: `%${value}%` };
        }
      });
    }
    return this.userModel.findAll({
      attributes: { exclude: ["password"] },
      where,
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.userModel.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    return user;
  }

  async update(id: number, body: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    if (body.email && body.email !== user.email) {
      const existingUser = await this.userModel.findOne({
        where: { email: body.email },
      });

      if (existingUser) {
        throw new ConflictException("Email já está em uso");
      }
    }

    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }

    await user.update(body);

    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    await user.destroy();
  }
}
