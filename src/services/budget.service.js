import { Op, fn, col } from 'sequelize';
import { Budget, Expense } from '../models/index.js';
import AppError from '../utils/AppError.js';

const setBudget = async (userId, { category, limitAmount, period, alertThreshold }) => {
  const [budget, created] = await Budget.findOrCreate({
    where: { userId, category },
    defaults: { limitAmount, period, alertThreshold },
  });

  if (!created) {
    await budget.update({
      limitAmount: limitAmount ?? budget.limitAmount,
      period: period ?? budget.period,
      alertThreshold: alertThreshold ?? budget.alertThreshold,
    });
  }

  return budget;
};

const getBudgets = async (userId) => {
  return Budget.findAll({ where: { userId }, order: [['category', 'ASC']] });
};

const getBudgetByCategory = async (userId, category) => {
  const budget = await Budget.findOne({ where: { userId, category } });
  if (!budget) {
    throw new AppError(`No budget set for category "${category}".`, 404);
  }
  return budget;
};

const deleteBudget = async (userId, budgetId) => {
  const budget = await Budget.findOne({ where: { id: budgetId, userId } });
  if (!budget) {
    throw new AppError('Budget not found.', 404);
  }
  await budget.destroy();
};

// --- Spend checking ---------------------------------------------------------

// Returns the start of the current week or month, used to scope "how much
// has been spent so far this period" for a given budget.
const getPeriodStart = (period) => {
  const now = new Date();
  if (period === 'weekly') {
    const day = now.getDay(); // 0 = Sunday
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  // monthly
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

// Sums this user's spend in `category` since the start of the budget's
// current period, and compares it against the limit.
const getBudgetStatus = async (userId, category) => {
  const budget = await Budget.findOne({ where: { userId, category } });
  if (!budget) return null; // no budget set for this category - nothing to check

  const periodStart = getPeriodStart(budget.period);

  const result = await Expense.findOne({
    where: {
      userId,
      category,
      date: { [Op.gte]: periodStart },
    },
    attributes: [[fn('COALESCE', fn('SUM', col('amount')), 0), 'spent']],
    raw: true,
  });

  const spent = parseFloat(result.spent);
  const limit = parseFloat(budget.limitAmount);
  const percentUsed = limit > 0 ? spent / limit : 0;

  return {
    category,
    period: budget.period,
    limit,
    spent,
    percentUsed: Math.round(percentUsed * 100),
    isOverBudget: spent > limit,
    isNearLimit: percentUsed >= parseFloat(budget.alertThreshold) && spent <= limit,
  };
};

// Checked automatically right after an expense is created (see
// expenseService.createExpense) so callers get a warning in the same
// response instead of needing a separate request.
const checkBudgetAfterExpense = async (userId, category) => {
  const status = await getBudgetStatus(userId, category);
  if (!status) return null;
  if (!status.isNearLimit && !status.isOverBudget) return null;
  return status; // only return something when a warning is actually relevant
};

export default {
  setBudget,
  getBudgets,
  getBudgetByCategory,
  deleteBudget,
  getBudgetStatus,
  checkBudgetAfterExpense,
};