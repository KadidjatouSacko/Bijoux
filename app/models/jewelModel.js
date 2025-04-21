import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize-client.js";

export class Jewel extends Model {}

Jewel.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price_ttc: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    tva: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 20.0,
    },
    price_ht: {
      type: DataTypes.DECIMAL(10, 2),
    },
    taille: {
      type: DataTypes.STRING,
    },
    poids: {
      type: DataTypes.DECIMAL(6, 2),
    },
    matiere: {
      type: DataTypes.STRING,
    },
    carat: {
      type: DataTypes.INTEGER,
    },
    image: {
      type: DataTypes.TEXT,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    category_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    tableName: "jewel",
    timestamps: false,
  }
);
