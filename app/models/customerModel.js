import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize-client.js";
import { Role } from "./Role.js";  // Import du modèle Role

export class Customer extends Model {}

Customer.init(
  {
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
    },
    phone: {
      type: DataTypes.STRING,
    },
    role_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Role, // référence au modèle Role
        key: "id",  // clé primaire de Role
      },
      defaultValue: 1, // rôle par défaut "client"
    },
  },
  {
    sequelize,
    tableName: "customer",
    timestamps: false,
  }
);
