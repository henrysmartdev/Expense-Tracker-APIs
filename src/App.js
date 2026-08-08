import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import budgetRoutes from './routes/budget.route.js';
import errorHandler from './middlewares/erroHandler.js';
import AppError from './utils/AppError.js';

const app = express();

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/expenses', expenseRoutes);
app.use('/budgets', budgetRoutes);

// Express 5 requires a named wildcard instead of a bare '*'.
app.all('/*splat', (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
});

app.use(errorHandler);

export default app;