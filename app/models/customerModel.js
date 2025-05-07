import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize-client.js";
import { Role } from "./roleModel.js";  // Import du modèle Role



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

      allowNull: false,
      defaultValue: 1,
      references: {
        model: 'role',
        key: 'id'},
        onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
      },
    createdAt: {
      type: DataTypes.DATE, // ou DataTypes.TIMESTAMP si tu veux un horodatage plus précis
      field: 'created_at',  // Mappe le nom de la colonne dans la base de données
      allowNull: false,      // Si tu veux l'obliger
      defaultValue: DataTypes.NOW, // Valeur par défaut si tu veux une valeur par défaut
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
