import "dotenv/config";
import { Sequelize } from "sequelize";
import  "./associations.js"

export const sequelize = new Sequelize(
    process.env.PG_URL,
    {
    // on va faire la correpondance des champs updatedAt et createdAt
        define: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    }
);

// Test de la connexion
sequelize.authenticate()
    .then(() => console.log('La connexion à la base de données a réussi.'))
    .catch((error) => console.error('Impossible de se connecter à la base de données:', error));