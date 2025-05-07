import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize-client.js";

export class Cart extends Model {}

Cart.init(
  {
    // id: {
    //   type: DataTypes.INTEGER,
    //   primaryKey: true,
    //   autoIncrement: true,
    // },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customer', // Table "customer" dans la base de données
        key: 'id', // Clé primaire dans la table customer
      },
      onDelete: 'CASCADE', // Supprime les articles du panier quand l'utilisateur est supprimé
    },
    jewel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'jewel', // Table "jewel" dans la base de données
        key: 'id', // Clé primaire dans la table jewel
      },
      onDelete: 'CASCADE', // Supprime les articles du panier quand le bijou est supprimé
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    added_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize, // La connexion à la base de données
    modelName: 'Cart',
    tableName: 'cart', // Nom de la table dans la base de données
    timestamps: false, // Si tu veux que Sequelize gère automatiquement les timestamps, définis `timestamps: true` et ajoute `createdAt` et `updatedAt` dans le modèle
    hooks: {
      beforeUpdate: (cart) => {
        cart.updated_at = new Date();
      },
    },
  }
);

