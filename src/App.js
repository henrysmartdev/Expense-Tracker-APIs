import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import budgetRoutes from './routes/budget.route.js';
import errorHandler from './middlewares/erroHandler.js';
import AppError from './utils/AppError.js';

const app = express();

app.use(cors());
app.use(express.json());

// Health check - handy for confirming the server is up before wiring a frontend to it.
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/expenses', expenseRoutes);
app.use('/budgets', budgetRoutes);

// Catches any request to a route that doesn't exist.
app.all('*', (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
});

// Must be registered last - this is what actually sends error responses.
app.use(errorHandler);

export default app;