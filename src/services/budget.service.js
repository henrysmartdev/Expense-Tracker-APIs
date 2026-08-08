import { Op, fn, col } from 'sequelize';
import { Budget, Expense, User } from '../models/index.js';
import AppError from '../utils/AppError.js';
import emailService from './email.service.js';

// --- CRUD -----------------------------------------------------------------

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

const getPeriodStart = (period) => {
  const now = new Date();
  if (period === 'weekly') {
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const getBudgetStatus = async (userId, category) => {
  const budget = await Budget.findOne({ where: { userId, category } });
  if (!budget) return null;

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
    budget,
    category,
    period: budget.period,
    limit,
    spent,
    percentUsed: Math.round(percentUsed * 100),
    isOverBudget: spent > limit,
    isNearLimit: percentUsed >= parseFloat(budget.alertThreshold) && spent <= limit,
  };
};

// Called right after an expense is created. Checks the budget, and if the
// threshold was crossed, fires an email alert - but only once per period,
// tracked via budget.lastAlertSentAt, so the user isn't emailed on every
// single expense once they're already near/over the limit.
const checkBudgetAfterExpense = async (userId, category) => {
  const status = await getBudgetStatus(userId, category);
  if (!status) return null;
  if (!status.isNearLimit && !status.isOverBudget) return null;

  const { budget } = status;
  const alreadyAlertedThisPeriod =
    budget.lastAlertSentAt &&
    budget.lastAlertSentAt >= getPeriodStart(budget.period);

  if (!alreadyAlertedThisPeriod) {
    const user = await User.findByPk(userId);
    // Fire-and-forget: don't let a slow/failed email delay the API response.
    emailService.sendBudgetAlert(user, status).catch((err) => {
      console.error('Failed to send budget alert email:', err.message);
    });
    budget.lastAlertSentAt = new Date();
    await budget.save();
  }

  delete status.budget; // don't leak the raw model instance to the API response
  return status;
};

export default {
  setBudget,
  getBudgets,
  getBudgetByCategory,
  deleteBudget,
  getBudgetStatus,
  checkBudgetAfterExpense,
};