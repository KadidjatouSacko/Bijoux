import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize-client.js";

export class Role extends Model {}

Role.init(
  {
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "role",
    timestamps: false,
  }
);
