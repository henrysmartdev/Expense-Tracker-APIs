import expenseService from '../services/expenseService.js';
import catchAsync from '../utils/catchAsync.js';

const createExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.createExpense(req.userId, req.body);
  res.status(201).json({ data: expense });
});

// Handles both plain listing and filtering/search, since they're driven
// by the same query params: ?category=&from=&to=&search=&page=&limit=
const getExpenses = catchAsync(async (req, res) => {
  const { expenses, pagination } = await expenseService.getExpenses(req.userId, req.query);
  res.status(200).json({ data: expenses, pagination });
});

const getExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.getExpenseById(req.userId, req.params.id);
  res.status(200).json({ data: expense });
});

const updateExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.updateExpense(req.userId, req.params.id, req.body);
  res.status(200).json({ data: expense });
});

const deleteExpense = catchAsync(async (req, res) => {
  await expenseService.deleteExpense(req.userId, req.params.id);
  res.status(204).send();
});

// GET /expenses/summary?from=&to=&groupBy=month|week
// Returns everything a dashboard would want in one call: total spent,
// spend per category, time breakdown, and the highest category.
const getSummary = catchAsync(async (req, res) => {
  const summary = await expenseService.getSummary(req.userId, req.query);
  res.status(200).json({ data: summary });
});

export default {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getSummary,
};