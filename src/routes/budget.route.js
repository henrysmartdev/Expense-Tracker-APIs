import { Router } from 'express';
import budgetController from '../controllers/budget.controller.js';
import requireAuth from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/:category/status', budgetController.getBudgetStatus);

router.route('/')
  .get(budgetController.getBudgets)
  .post(budgetController.setBudget);

router.delete('/:id', budgetController.deleteBudget);

export default router;