import { Model, DataTypes } from 'sequelize';
import slugify from 'slugify';
import { sequelize } from './sequelize-client.js'; // Assurez-vous d'avoir bien configuré Sequelize

import { Category } from './categoryModel.js';  // Assure-toi d'importer le modèle Category
import { Type } from './TypeModel.js';      // Assure-toi d'importer le modèle Types

export class Jewel extends Model {}


Jewel.init({
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price_ttc: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tva: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 20.00
  },
  price_ht: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  taille: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  poids: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  matiere: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  carat: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'category',
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  popularity_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  type_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Types', // Le nom de la table (pluriel ou singulier selon ta configuration)
      key: 'id',
    },
  }
}, {
  sequelize,
  modelName: 'Jewel',
  tableName: 'jewel', // Correspondre au nom de la table dans la base de données
  timestamps: false,
  hooks: {
    beforeCreate: (jewel) => {
      jewel.slug = slugify(jewel.name, { lower: true });
    },
    beforeUpdate: (jewel) => {
      jewel.slug = slugify(jewel.name, { lower: true });
    }
  }
});

// Définir les relations
Jewel.belongsTo(Category, { foreignKey: 'category_id' });
Jewel.belongsTo(Type, { foreignKey: 'type_id' });


// Jewel.init(
//   {
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     description: {
//       type: DataTypes.TEXT,
//     },
//     price_ttc: {
//       type: DataTypes.DECIMAL(10, 2),
//       allowNull: false,
//     },
//     tva: {
//       type: DataTypes.DECIMAL(5, 2),
//       defaultValue: 20.0,
//     },
//     price_ht: {
//       type: DataTypes.DECIMAL(10, 2),
//     },
//     taille: {
//       type: DataTypes.STRING,
//     },
//     poids: {
//       type: DataTypes.DECIMAL(6, 2),
//     },
//     matiere: {
//       type: DataTypes.STRING,
//     },
//     carat: {
//       type: DataTypes.INTEGER,
//     },
//     image: {
//       type: DataTypes.TEXT,
//     },
//     stock: {
//       type: DataTypes.INTEGER,
//       defaultValue: 0,
//     },
//     category_id: {
//       type: DataTypes.INTEGER,
//     },
//   },
//   {
//     sequelize,
//     tableName: "jewel",
//     timestamps: false,
//   }
// );

