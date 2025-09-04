import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ProjectsService } from "./projects.service";
import { ProjectsController } from "./projects.controller";
import { Project } from "./project.model";
import { User } from "../users/user.model";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [SequelizeModule.forFeature([Project, User]), UsersModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
