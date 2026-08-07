import budgetService from '../services/budgetService.js';
import catchAsync from '../utils/catchAsync.js';


const setBudget = catchAsync(async (req, res) => {
  const budget = await budgetService.setBudget(req.userId, req.body);
  res.status(201).json({ data: budget });
});

const getBudgets = catchAsync(async (req, res) => {
  const budgets = await budgetService.getBudgets(req.userId);
  res.status(200).json({ data: budgets });
});

const deleteBudget = catchAsync(async (req, res) => {
  await budgetService.deleteBudget(req.userId, req.params.id);
  res.status(204).send();
});

// GET /budgets/:category/status - current spend vs. limit for one category,
// checked on demand (independent of the auto-check that runs on expense creation).
const getBudgetStatus = catchAsync(async (req, res) => {
  const status = await budgetService.getBudgetStatus(req.userId, req.params.category);
  res.status(200).json({ data: status });
});

export default { setBudget, getBudgets, deleteBudget, getBudgetStatus };