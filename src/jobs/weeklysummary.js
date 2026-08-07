

import { schedule } from 'node-cron';

schedule('0 8 * * 1', async () => { // 8am every Monday
  const users = await User.find();
  for (const user of users) {
    const summary = await buildWeeklySummary(user._id);
    await sendWeeklySummaryEmail(user, summary);
  }
});