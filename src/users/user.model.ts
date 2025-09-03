import { Column, DataType, Model, Table, Unique } from "sequelize-typescript";

@Table({
  tableName: "users",
  timestamps: true,
  paranoid: true,
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

  @Unique
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
}
