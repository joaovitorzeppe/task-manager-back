import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { ProjectMember } from "./project-member.model";
import { Project } from "./project.model";

@Injectable()
export class ProjectMembersService {
  constructor(
    @InjectModel(ProjectMember)
    private readonly projectMemberModel: typeof ProjectMember,
    @InjectModel(Project)
    private readonly projectModel: typeof Project
  ) {}

  async getProjectIdsForUser(userId: number): Promise<number[]> {
    const memberships = await this.projectMemberModel.findAll({
      attributes: ["projectId"],
      where: { userId },
      raw: true,
    });

    const managed = await this.projectModel.findAll({
      attributes: ["id"],
      where: { managerId: userId },
      raw: true,
    });

    const ids = new Set<number>();

    memberships.forEach((m) => ids.add(m.projectId));
    managed.forEach((p) => ids.add(p.id));

    return Array.from(ids);
  }
}
