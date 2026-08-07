// services/emailService.js
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendBudgetAlert(userId, budget, spent) {
  const user = await User.findById(userId);
  const pct = Math.round((spent / budget.limitAmount) * 100);

  await resend.emails.send({
    from: 'alerts@yourdomain.com',
    to: user.email,
    subject: `Budget alert: ${budget.category} is at ${pct}%`,
    html: `<p>You've spent $${spent.toFixed(2)} of your $${budget.limitAmount} 
           budget for <strong>${budget.category}</strong> this ${budget.period}.</p>`
  });
}

export default { sendBudgetAlert };