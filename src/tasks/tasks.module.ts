import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { Task } from "./task.model";
import { TaskComment } from "./task-comment.model";
import { User } from "../users/user.model";
import { Project } from "../projects/project.model";
import { ProjectMember } from "../projects/project-member.model";
import { ProjectMembersService } from "../projects/project-members.service";
import { TasksGateway } from "./tasks.gateway";

@Module({
  imports: [
    SequelizeModule.forFeature([
      Task,
      TaskComment,
      User,
      Project,
      ProjectMember,
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService, ProjectMembersService, TasksGateway],
  exports: [TasksService],
})
export class TasksModule {}
