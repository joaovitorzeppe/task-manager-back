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
import { ProjectMember } from "./project-member.model";
import { AddProjectMemberDto } from "./dto/add-project-member.dto";
import { UpdateProjectMemberDto } from "./dto/update-project-member.dto";
import { ProjectMemberInputDto } from "./dto/project-member-input.dto";
import { Attachment } from "./attachment.model";

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project)
    private projectModel: typeof Project,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(ProjectMember)
    private projectMemberModel: typeof ProjectMember
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

    await this.projectMemberModel.findOrCreate({
      where: { projectId: project.id, userId: body.managerId },
      defaults: {
        projectId: project.id,
        userId: body.managerId,
        role: "maintainer",
      },
    });

    if (body.members && body.members.length > 0) {
      const toAdd: ProjectMemberInputDto[] = body.members.filter(
        (m) => m.userId !== body.managerId
      );
      for (const member of toAdd) {
        await this.addMember(project.id, member);
      }
    }

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
        {
          model: ProjectMember,
          as: "members",
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
        {
          model: ProjectMember,
          as: "members",
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

    const membersCurrent = await this.projectMemberModel.findAll({
      attributes: ["id", "userId"],
      where: { projectId: id },
      raw: true,
    });
    for (const member of membersCurrent) {
      await this.removeMember(id, member.userId);
    }

    if (body.members && body.members.length > 0) {
      for (const member of body.members) {
        await this.addMember(id, member);
      }
    }

    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    const project = await this.findById(id);

    if (!project) {
      throw new NotFoundException("Projeto não encontrado");
    }

    await project.destroy();
  }

  async addMember(projectId: number, body: AddProjectMemberDto) {
    const exists = await this.projectModel.findByPk(projectId, {
      attributes: ["id"],
      raw: true,
    });

    if (!exists) {
      throw new NotFoundException("Projeto não encontrado");
    }

    const user = await this.userModel.findByPk(body.userId, { raw: true });

    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    const [member] = await this.projectMemberModel.findOrCreate({
      where: { projectId, userId: body.userId },
      defaults: { projectId, userId: body.userId, role: body.role },
    });

    if (member.role !== body.role) {
      await member.update({ role: body.role });
    }

    return this.findById(projectId);
  }

  async updateMember(
    projectId: number,
    memberId: number,
    body: UpdateProjectMemberDto
  ) {
    const exists = await this.projectModel.findByPk(projectId, {
      attributes: ["id"],
      raw: true,
    });

    if (!exists) {
      throw new NotFoundException("Projeto não encontrado");
    }

    const member = await this.projectMemberModel.findOne({
      where: { userId: memberId, projectId },
    });

    if (!member) {
      throw new NotFoundException("Membro não encontrado");
    }

    await member.update({ role: body.role });

    return this.findById(projectId);
  }

  async removeMember(projectId: number, memberId: number) {
    const exists = await this.projectModel.findByPk(projectId, {
      attributes: ["id"],
      raw: true,
    });

    if (!exists) {
      throw new NotFoundException("Projeto não encontrado");
    }

    const member = await this.projectMemberModel.findOne({
      where: { userId: memberId, projectId },
      logging: console.log,
    });

    if (!member) {
      throw new NotFoundException("Membro não encontrado");
    }

    await member.destroy();
  }

  async createAttachment(data: {
    filename: string;
    mimeType: string;
    size: number;
    path: string;
    url: string;
    projectId?: number;
    taskId?: number;
    taskCommentId?: number;
    uploadedById: number;
  }) {
    return (Attachment as any).create(data);
  }

  async listAttachments(filter: {
    projectId?: number;
    taskId?: number;
    taskCommentId?: number;
  }) {
    const where: any = {};
    if (filter.projectId) where.projectId = filter.projectId;
    if (filter.taskId) where.taskId = filter.taskId;
    if (filter.taskCommentId) where.taskCommentId = filter.taskCommentId;
    return (Attachment as any).findAll({
      where,
      order: [["createdAt", "DESC"]],
    });
  }

  async removeAttachment(attachmentId: number): Promise<void> {
    const attachment = (await (Attachment as any).findByPk(
      attachmentId
    )) as Attachment | null;
    if (!attachment) return;
    try {
      const fs = require("fs");
      if (attachment.path && fs.existsSync(attachment.path)) {
        fs.unlinkSync(attachment.path);
      }
    } catch {}
    await (attachment as any).destroy();
  }
}
