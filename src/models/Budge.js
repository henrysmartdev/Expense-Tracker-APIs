import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

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
      type: DataTypes.DECIMAL(3, 2), // e.g. 0.90 = warn at 90% of limit
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
      // One budget per category per user - creating a second budget for
      // "food" should update the existing one, not create a duplicate.
      { unique: true, fields: ['user_id', 'category'] },
    ],
  }
);
// add to Budget model: lastAlertSentAt, alertThreshold (e.g. 0.9)
if (spent >= budget.limitAmount * budget.alertThreshold) {
  const alreadyAlertedThisPeriod = budget.lastAlertSentAt && 
    isSamePeriod(budget.lastAlertSentAt, new Date(), budget.period);
  if (!alreadyAlertedThisPeriod) {
    await sendBudgetAlert(userId, budget, spent);
    budget.lastAlertSentAt = new Date();
    await budget.save();
  }
}

export default Budget;