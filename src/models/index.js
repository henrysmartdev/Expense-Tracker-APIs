import User from './User.js';
import Expense from './Expense.js';
import Budget from './Budget.js';

// One user has many expenses. Setting up both directions of the
// association lets us do things like user.getExpenses() and
// expense.getUser() if we ever need to, and it's what lets Sequelize
// enforce the foreign key relationship.
User.hasMany(Expense, { foreignKey: 'userId', as: 'expenses' });
Expense.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// One user has many budgets (one per category, enforced by the unique
// index on the Budget model).
User.hasMany(Budget, { foreignKey: 'userId', as: 'budgets' });
Budget.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { User, Expense, Budget };