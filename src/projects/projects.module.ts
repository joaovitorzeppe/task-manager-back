import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ProjectsService } from "./projects.service";
import { ProjectsController } from "./projects.controller";
import { Project } from "./project.model";
import { ProjectMember } from "./project-member.model";
import { ProjectMembersService } from "./project-members.service";
import { User } from "../users/user.model";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    SequelizeModule.forFeature([Project, User, ProjectMember]),
    UsersModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectMembersService],
  exports: [ProjectsService, ProjectMembersService],
})
export class ProjectsModule {}
