import { Router } from 'express';
import expenseController from '../controllers/expense.controller.js';
import requireAuth from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth);

// Must come before /:id or Express would treat "summary" as an :id param.
router.get('/summary', expenseController.getSummary);

router.route('/')
  .get(expenseController.getExpenses)
  .post(expenseController.createExpense);

router.route('/:id')
  .get(expenseController.getExpense)
  .put(expenseController.updateExpense)
  .delete(expenseController.deleteExpense);

export default router;