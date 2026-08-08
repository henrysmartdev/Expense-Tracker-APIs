import { Op, fn, col, literal } from 'sequelize';
import { Expense } from '../models/index.js';
import AppError from '../utils/AppError.js';
import budgetService from './budget.service.js';

// --- CRUD ---------------------------------------------------------------

const createExpense = async (userId, { amount, category, date, description }) => {
  const expense = await Expense.create({ userId, amount, category, date, description });
  const budgetWarning = await budgetService.checkBudgetAfterExpense(userId, category);
  return { expense, budgetWarning };
};

const getExpenses = async (userId, query) => {
  const where = { userId };

  if (query.category) {
    where.category = query.category;
  }

  if (query.from || query.to) {
    where.date = {};
    if (query.from) where.date[Op.gte] = query.from;
    if (query.to) where.date[Op.lte] = query.to;
  }

  if (query.search) {
    where.description = { [Op.iLike]: `%${query.search}%` };
  }

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await Expense.findAndCountAll({
    where,
    order: [['date', 'DESC']],
    limit,
    offset,
  });

  return {
    expenses: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

const getExpenseById = async (userId, expenseId) => {
  const expense = await Expense.findOne({ where: { id: expenseId, userId } });
  if (!expense) {
    throw new AppError('Expense not found.', 404);
  }
  return expense;
};

const updateExpense = async (userId, expenseId, updates) => {
  const expense = await getExpenseById(userId, expenseId);
  await expense.update(updates);
  return expense;
};

const deleteExpense = async (userId, expenseId) => {
  const expense = await getExpenseById(userId, expenseId);
  await expense.destroy();
};

// --- Summaries & reports --------------------------------------------------

const buildDateWhere = (userId, query) => {
  const where = { userId };
  if (query.from || query.to) {
    where.date = {};
    if (query.from) where.date[Op.gte] = query.from;
    if (query.to) where.date[Op.lte] = query.to;
  }
  return where;
};

const getTotalSpent = async (userId, query) => {
  const where = buildDateWhere(userId, query);
  const result = await Expense.findOne({
    where,
    attributes: [[fn('COALESCE', fn('SUM', col('amount')), 0), 'total']],
    raw: true,
  });
  return { total: parseFloat(result.total) };
};

const getSpentByCategory = async (userId, query) => {
  const where = buildDateWhere(userId, query);
  const rows = await Expense.findAll({
    where,
    attributes: ['category', [fn('SUM', col('amount')), 'total']],
    group: ['category'],
    order: [[literal('total'), 'DESC']],
    raw: true,
  });
  return rows.map((r) => ({ category: r.category, total: parseFloat(r.total) }));
};

const getBreakdown = async (userId, query) => {
  const where = buildDateWhere(userId, query);
  const groupBy = query.groupBy === 'week' ? 'week' : 'month';

  const rows = await Expense.findAll({
    where,
    attributes: [
      [fn('date_trunc', groupBy, col('date')), 'period'],
      [fn('SUM', col('amount')), 'total'],
    ],
    group: [literal('period')],
    order: [[literal('period'), 'ASC']],
    raw: true,
  });

  return rows.map((r) => ({ period: r.period, total: parseFloat(r.total) }));
};

const getHighestCategory = async (userId, query) => {
  const byCategory = await getSpentByCategory(userId, query);
  if (byCategory.length === 0) return null;
  return byCategory[0];
};

const getSummary = async (userId, query) => {
  const [total, byCategory, breakdown] = await Promise.all([
    getTotalSpent(userId, query),
    getSpentByCategory(userId, query),
    getBreakdown(userId, query),
  ]);

  return {
    total: total.total,
    byCategory,
    breakdown,
    highestCategory: byCategory[0] || null,
  };
};

// Used by jobs/weeklysummary.js - scopes getSummary to the last 7 days
// for a single user, for the weekly email digest.
const getWeeklySummaryForUser = async (userId) => {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 7);

  return getSummary(userId, {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  });
};

export default {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getTotalSpent,
  getSpentByCategory,
  getBreakdown,
  getHighestCategory,
  getSummary,
  getWeeklySummaryForUser,
};