import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize-client.js";

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
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        address: {
            type: DataTypes.TEXT,
        },
        phone: {
            type: DataTypes.STRING,
        },
    },
    {
        sequelize,
        tableName: "customer",
    }
);
