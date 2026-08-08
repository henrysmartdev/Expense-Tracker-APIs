import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Budget = sequelize.define(
  'Budget',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    limitAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'limit_amount',
      validate: { min: 0.01 },
    },
    period: {
      type: DataTypes.ENUM('weekly', 'monthly'),
      allowNull: false,
      defaultValue: 'monthly',
    },
    alertThreshold: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.9,
      field: 'alert_threshold',
    },
    lastAlertSentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_alert_sent_at',
    },
  },
  {
    tableName: 'budgets',
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { unique: true, fields: ['user_id', 'category'] },
    ],
  }
);

export default Budget;