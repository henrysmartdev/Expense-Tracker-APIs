import User from './User.js';
import Expense from './Expense.js';

// One user has many expenses. Setting up both directions of the
// association lets us do things like user.getExpenses() and
// expense.getUser() if we ever need to, and it's what lets Sequelize
// enforce the foreign key relationship.
User.hasMany(Expense, { foreignKey: 'userId', as: 'expenses' });
Expense.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { User, Expense };