import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Task } from "./task.model";
import { User } from "../users/user.model";

@Table({
  tableName: "task_comments",
  timestamps: true,
  paranoid: true,
})
export class TaskComment extends Model<TaskComment> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Task)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  taskId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  authorId: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  content: string;

  @BelongsTo(() => Task)
  task: Task;

  @BelongsTo(() => User, "authorId")
  author: User;
}
