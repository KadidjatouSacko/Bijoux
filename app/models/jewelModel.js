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
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
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
    }
);
