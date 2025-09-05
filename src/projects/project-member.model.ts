import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Project } from "./project.model";
import { User } from "../users/user.model";

@Table({
  tableName: "project_members",
  timestamps: true,
})
export class ProjectMember extends Model<
  {
    id: number;
    projectId: number;
    userId: number;
    role: "viewer" | "contributor" | "maintainer";
    createdAt?: Date;
    updatedAt?: Date;
  },
  {
    projectId: number;
    userId: number;
    role: "viewer" | "contributor" | "maintainer";
  }
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Project)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  projectId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @Column({
    type: DataType.ENUM("viewer", "contributor", "maintainer"),
    allowNull: false,
    defaultValue: "viewer",
  })
  role: "viewer" | "contributor" | "maintainer";

  @BelongsTo(() => Project)
  project: Project;

  @BelongsTo(() => User)
  user: User;
}
