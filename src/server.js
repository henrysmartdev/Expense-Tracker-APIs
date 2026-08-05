import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import sequelize from './config/database.js';
import './models/index.js'; // ensures associations are registered before sync

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // In production you'd use proper migrations instead of sync().
    // { alter: true } is convenient for development - it updates tables
    // to match your models without dropping data.
    await sequelize.sync({ alter: true });
    console.log('Models synced.');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
