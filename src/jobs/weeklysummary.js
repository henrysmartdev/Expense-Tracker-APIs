import cron from 'node-cron';
import { User } from '../models/index.js';
import expenseService from '../services/expense.service.js';
import emailService from '../services/email.service.js';

// Runs every Monday at 8am server time. Sends each user a summary of what
// they spent over the last 7 days.
const startWeeklySummaryJob = () => {
  cron.schedule('0 8 * * 1', async () => {
    console.log('Running weekly summary job...');
    const users = await User.findAll();

    for (const user of users) {
      try {
        const summary = await expenseService.getWeeklySummaryForUser(user.id);
        if (summary.total > 0) {
          await emailService.sendWeeklySummary(user, summary);
        }
      } catch (err) {
        console.error(`Failed to send weekly summary to ${user.email}:`, err.message);
      }
    }
  });
};

export default startWeeklySummaryJob;