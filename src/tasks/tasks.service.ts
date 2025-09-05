import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Task } from "./task.model";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { Op } from "sequelize";

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task)
    private taskModel: typeof Task
  ) {}

  async create(body: CreateTaskDto): Promise<Task> {
    const task = await this.taskModel.create({
      title: body.title,
      description: body.description,
      status: body.status || "todo",
      priority: body.priority || "medium",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      projectId: body.projectId,
      assigneeId: body.assigneeId,
    } as Task);

    return task;
  }

  async findAll(options?: {
    status?: string;
    priority?: string;
    projectId?: number;
    projectIds?: number[];
    assigneeId?: number;
    title?: string;
  }): Promise<Task[]> {
    const where: any = {};
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "title") {
            where[key] = { [Op.iLike]: `%${value}%` };
          } else if (key === "projectIds") {
            where.projectId = { [Op.in]: value as number[] };
          } else {
            where[key] = value;
          }
        }
      });
    }

    return this.taskModel.findAll({
      where,
      include: [
        {
          model: require("../projects/project.model").Project,
          as: "project",
          attributes: ["id", "name"],
        },
        {
          model: require("../users/user.model").User,
          as: "assignee",
          attributes: ["id", "name", "email"],
        },
      ],
    });
  }

  async findById(id: number): Promise<Task> {
    const task = await this.taskModel.findByPk(id, {
      include: [
        {
          model: require("../projects/project.model").Project,
          as: "project",
          attributes: ["id", "name", "description"],
        },
        {
          model: require("../users/user.model").User,
          as: "assignee",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });

    if (!task) {
      throw new NotFoundException("Tarefa não encontrada");
    }

    return task;
  }

  async update(id: number, body: UpdateTaskDto): Promise<Task> {
    const task = await this.findById(id);

    if (!task) {
      throw new NotFoundException("Tarefa não encontrada");
    }

    const updateData: any = { ...body };
    if (body.dueDate) {
      updateData.dueDate = new Date(body.dueDate);
    }

    await task.update(updateData);

    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    const task = await this.findById(id);

    if (!task) {
      throw new NotFoundException("Tarefa não encontrada");
    }

    await task.destroy();
  }
}
