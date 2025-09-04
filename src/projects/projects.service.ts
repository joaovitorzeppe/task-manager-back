import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Project } from "./project.model";
import { User } from "../users/user.model";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { Op } from "sequelize";

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project)
    private projectModel: typeof Project,
    @InjectModel(User)
    private userModel: typeof User
  ) {}

  async create(body: CreateProjectDto): Promise<Project> {
    const manager = await this.userModel.findByPk(body.managerId, {
      raw: true,
    });
    if (!manager) {
      throw new NotFoundException("Gerente não encontrado");
    }
    if (!["manager", "admin"].includes(manager.role)) {
      throw new BadRequestException("Usuário escolhido não é um gerente");
    }

    const startDate = new Date(body.startDate);
    if (body.endDate) {
      const endDate = new Date(body.endDate);
      if (endDate <= startDate) {
        throw new BadRequestException(
          "Data de término deve ser posterior à data de início"
        );
      }
    }

    const project = await this.projectModel.create({
      name: body.name,
      description: body.description,
      status: body.status,
      startDate: startDate,
      endDate: body.endDate ? new Date(body.endDate) : null,
      managerId: body.managerId,
    } as Project);

    return this.findById(project.id);
  }

  async findAll(options?: {
    name?: string;
    status?: string[];
    managerId?: number;
  }): Promise<Project[]> {
    const where: any = {};
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value) {
          if (key === "name") {
            where[key] = { [Op.iLike]: `%${value}%` };
          } else if (key === "status") {
            where[key] = { [Op.in]: value };
          } else {
            where[key] = value;
          }
        }
      });
    }

    return this.projectModel.findAll({
      where,
      include: [
        {
          model: User,
          as: "manager",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });
  }

  async findById(id: number): Promise<Project> {
    const project = await this.projectModel.findByPk(id, {
      include: [
        {
          model: User,
          as: "manager",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });

    if (!project) {
      throw new NotFoundException("Projeto não encontrado");
    }

    return project;
  }

  async update(id: number, body: UpdateProjectDto): Promise<Project> {
    const project = await this.findById(id);

    if (!project) {
      throw new NotFoundException("Projeto não encontrado");
    }

    if (body.managerId) {
      const manager = await this.userModel.findByPk(body.managerId, {
        raw: true,
      });
      if (!manager) {
        throw new NotFoundException("Gerente não encontrado");
      }

      if (!["manager", "admin"].includes(manager.role)) {
        throw new BadRequestException(
          "Gerente deve ter role de manager ou admin"
        );
      }
    }

    if (body.startDate || body.endDate) {
      const startDate = body.startDate
        ? new Date(body.startDate)
        : new Date(project.startDate);

      const endDate = body.endDate ? new Date(body.endDate) : project.endDate;

      if (endDate && endDate <= startDate) {
        throw new BadRequestException(
          "Data de término deve ser posterior à data de início"
        );
      }
    }

    const updateData: any = { ...body };
    if (body.startDate) {
      updateData.startDate = new Date(body.startDate);
    }
    if (body.endDate) {
      updateData.endDate = new Date(body.endDate);
    }

    await project.update(updateData);

    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    const project = await this.findById(id);

    if (!project) {
      throw new NotFoundException("Projeto não encontrado");
    }

    await project.destroy();
  }
}
