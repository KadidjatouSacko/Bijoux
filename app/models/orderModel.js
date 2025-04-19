import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize-client.js";

export class Order extends Model {}

Order.init(
    {
        order_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: "en attente",
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
        },
        customer_id: {
            type: DataTypes.INTEGER,
        },
    },
    {
        sequelize,
        tableName: "order",
    }
);
