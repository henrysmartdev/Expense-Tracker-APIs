import User from './User.js';
import Expense from './Expense.js';
import Budget from './Budget.js';

User.hasMany(Expense, { foreignKey: 'userId', as: 'expenses' });
Expense.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Budget, { foreignKey: 'userId', as: 'budgets' });
Budget.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { User, Expense, Budget };