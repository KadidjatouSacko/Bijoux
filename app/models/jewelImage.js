// Dans votre fichier de modèle JewelImage.js
import{ Model, DataTypes } from'sequelize';
import { sequelize } from "./sequelize-client.js";


export class JewelImage extends Model {}

JewelImage.init({
  image_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  jewel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'jewel',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  sequelize,
  modelName: 'jewel_image',
  tableName: 'jewel_images',
  timestamps: false
});

