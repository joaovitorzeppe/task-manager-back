import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Task } from "./task.model";
import { TaskComment } from "./task-comment.model";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { Op } from "sequelize";
import { TasksGateway } from "./tasks.gateway";

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task)
    private taskModel: typeof Task,
    @InjectModel(TaskComment)
    private taskCommentModel: typeof TaskComment,
    private readonly tasksGateway: TasksGateway
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

    this.tasksGateway.emitTasksChanged();
    return task;
  }

  async findAll(options?: {
    status?: string;
    priority?: string;
    projectId?: number;
    projectIds?: number[];
    assigneeId?: number;
    title?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
  }): Promise<Task[]> {
    const where: any = {};
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "title") {
            where[key] = { [Op.iLike]: `%${value}%` };
          } else if (key === "projectIds") {
            where.projectId = { [Op.in]: value as number[] };
          } else if (key === "dueDateFrom" || key === "dueDateTo") {
          } else {
            where[key] = value;
          }
        }
      });
    }

    if (options?.dueDateFrom && options?.dueDateTo) {
      where.dueDate = {
        [Op.between]: [
          new Date(options.dueDateFrom),
          new Date(options.dueDateTo),
        ],
      };
    } else if (options?.dueDateFrom) {
      where.dueDate = { [Op.gte]: new Date(options.dueDateFrom) };
    } else if (options?.dueDateTo) {
      where.dueDate = { [Op.lte]: new Date(options.dueDateTo) };
    }

    const projectInclude: any = {
      model: require("../projects/project.model").Project,
      as: "project",
      attributes: ["id", "name"],
    };

    if (options?.projectIds && options.projectIds.length > 0) {
      projectInclude.where = { id: { [Op.in]: options.projectIds } };
      projectInclude.required = true;
    } else if (options?.projectId) {
      projectInclude.where = { id: options.projectId };
      projectInclude.required = true;
    }

    return this.taskModel.findAll({
      where,
      include: [
        projectInclude,
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

  async getComments(taskId: number): Promise<TaskComment[]> {
    return this.taskCommentModel.findAll({
      where: { taskId },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: require("../users/user.model").User,
          as: "author",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });
  }

  async addComment(
    taskId: number,
    authorId: number,
    content: string
  ): Promise<TaskComment> {
    const task = await this.findById(taskId);
    if (!task) {
      throw new NotFoundException("Tarefa não encontrada");
    }
    const comment = await this.taskCommentModel.create({
      taskId,
      authorId,
      content,
    } as TaskComment);
    return this.taskCommentModel.findByPk(comment.id, {
      include: [
        {
          model: require("../users/user.model").User,
          as: "author",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    }) as unknown as TaskComment;
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

    const updated = await this.findById(id);
    this.tasksGateway.emitTasksChanged();
    return updated;
  }

  async remove(id: number): Promise<void> {
    const task = await this.findById(id);

    if (!task) {
      throw new NotFoundException("Tarefa não encontrada");
    }

    await task.destroy();
    this.tasksGateway.emitTasksChanged();
  }
}
