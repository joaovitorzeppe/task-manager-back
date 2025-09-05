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
import { Task } from "../tasks/task.model";
import { ProjectMember } from "./project-member.model";

@Table({
  tableName: "projects",
  timestamps: true,
  paranoid: true,
})
export class Project extends Model<Project> {
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
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.ENUM("planned", "active", "completed", "cancelled"),
    allowNull: false,
    defaultValue: "planned",
  })
  status: "planned" | "active" | "completed" | "cancelled";

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  startDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  endDate: Date;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  managerId: number;

  @BelongsTo(() => User)
  manager: User;

  @HasMany(() => Task)
  tasks: Task[];

  @HasMany(() => ProjectMember)
  members: ProjectMember[];
}
