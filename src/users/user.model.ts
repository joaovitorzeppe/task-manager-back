import { Column, DataType, Model, Table, HasMany } from "sequelize-typescript";
import { Project } from "../projects/project.model";
import { Task } from "../tasks/task.model";

@Table({
  tableName: "users",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      name: "users_email_deleted_at_unique",
      unique: true,
      fields: ["email", "deletedAt"],
    },
  ],
})
export class User extends Model<User> {
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
    type: DataType.STRING,
    allowNull: false,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.ENUM("admin", "manager", "developer"),
    allowNull: false,
    defaultValue: "developer",
  })
  role: "admin" | "manager" | "developer";

  @HasMany(() => Project)
  projects: Project[];

  @HasMany(() => Task)
  assignedTasks: Task[];
}
