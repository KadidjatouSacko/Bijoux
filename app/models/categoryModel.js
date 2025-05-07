// models/categoryModel.js
import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize-client.js";  // Importation correcte après l'initialisation de Sequelize

export class Category extends Model {}

Category.init(
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,  // Pour éviter les catégories dupliquées
        },
    },
    {
        sequelize,  // Utilisation de sequelize après son initialisation
        tableName: "category",  // Nom de la table dans la base de données
    }
);
