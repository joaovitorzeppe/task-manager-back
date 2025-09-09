import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Project } from "./project.model";
import { Task } from "../tasks/task.model";
import { TaskComment } from "../tasks/task-comment.model";
import { User } from "../users/user.model";

@Table({
  tableName: "attachments",
  timestamps: true,
  paranoid: true,
})
export class Attachment extends Model<Attachment> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  filename: string;

  @Column({ type: DataType.STRING, allowNull: false })
  mimeType: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  size: number;

  @Column({ type: DataType.STRING, allowNull: false })
  path: string;

  @Column({ type: DataType.STRING, allowNull: false })
  url: string;

  @ForeignKey(() => Project)
  @Column({ type: DataType.INTEGER, allowNull: true })
  projectId?: number;

  @ForeignKey(() => Task)
  @Column({ type: DataType.INTEGER, allowNull: true })
  taskId?: number;

  @ForeignKey(() => TaskComment)
  @Column({ type: DataType.INTEGER, allowNull: true })
  taskCommentId?: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  uploadedById: number;

  @BelongsTo(() => Project)
  project?: Project;

  @BelongsTo(() => Task)
  task?: Task;

  @BelongsTo(() => TaskComment)
  taskComment?: TaskComment;

  @BelongsTo(() => User, "uploadedById")
  uploadedBy: User;
}
