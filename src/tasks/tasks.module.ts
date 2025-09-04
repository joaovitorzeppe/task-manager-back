import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { Task } from "./task.model";
import { User } from "../users/user.model";
import { Project } from "../projects/project.model";

@Module({
  imports: [SequelizeModule.forFeature([Task, User, Project])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
