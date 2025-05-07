import { Model, DataTypes } from 'sequelize';
import { sequelize } from './sequelize-client.js';

export class JewelView extends Model {}

JewelView.init({
  viewed_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
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
  modelName: 'jewel_view',
  tableName: 'jewel_views',
  timestamps: false
});
