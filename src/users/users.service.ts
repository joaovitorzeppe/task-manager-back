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

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException("Email já está em uso");
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.userModel.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
      role: createUserDto.role,
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

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userModel.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException("Email já está em uso");
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await user.update(updateUserDto);

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
