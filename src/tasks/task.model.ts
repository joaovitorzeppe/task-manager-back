import {
  Column,
  DataType,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { User } from "../users/user.model";
import { Project } from "../projects/project.model";
import { TaskComment } from "./task-comment.model";

@Table({
  tableName: "tasks",
  timestamps: true,
  paranoid: true,
})
export class Task extends Model<Task> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.ENUM("todo", "in_progress", "review", "done"),
    allowNull: false,
    defaultValue: "todo",
  })
  status: "todo" | "in_progress" | "review" | "done";

  @Column({
    type: DataType.ENUM("low", "medium", "high", "critical"),
    allowNull: false,
    defaultValue: "medium",
  })
  priority: "low" | "medium" | "high" | "critical";

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  dueDate: Date;

  @ForeignKey(() => Project)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  projectId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  assigneeId: number;

  @BelongsTo(() => Project)
  project: Project;

  @BelongsTo(() => User)
  assignee: User;

  @HasMany(() => TaskComment)
  comments: TaskComment[];
}
