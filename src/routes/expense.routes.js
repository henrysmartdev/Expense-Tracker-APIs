import { Router } from 'express';
import expenseController from '../controllers/expenseController.js';
import requireAuth from '../middleware/auth.js';

const router = Router();

// Every route below requires a valid JWT.
router.use(requireAuth);

// IMPORTANT: /summary must be declared before /:id, otherwise Express
// would match "summary" as an :id param and route it to getExpense instead.
router.get('/summary', expenseController.getSummary);

router.route('/')
  .get(expenseController.getExpenses)
  .post(expenseController.createExpense);

router.route('/:id')
  .get(expenseController.getExpense)
  .put(expenseController.updateExpense)
  .delete(expenseController.deleteExpense);

export default router;