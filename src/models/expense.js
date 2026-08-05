
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Expense = sequelize.define(
  'Expense',
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
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0.01 },
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      // e.g. food, rent, transport - kept as a free string for now so you
      // can add new categories without a migration. Could become an ENUM
      // or a separate Category table later if you want more structure.
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'expenses',
    timestamps: true,
    paranoid: true, 
    indexes: [
      { fields: ['user_id'] },
      { fields: ['category'] },
      { fields: ['date'] },
    ],
  }
);

export default Expense;