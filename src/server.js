import dotenv from 'dotenv';
dotenv.config();

import app from './App.js';
import sequelize from './config/db.js';
import './models/index.js';
import startWeeklySummaryJob from './jobs/weeklysummary.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Development convenience - swap for real migrations in production.
    await sequelize.sync({ alter: true });
    console.log('Models synced.');

    startWeeklySummaryJob();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();