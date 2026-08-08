import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Fired from expense.service.js right after an expense pushes a category
// near or over its budget limit. Fire-and-forget from the caller's side -
// this function itself still awaits the send so errors surface here.
const sendBudgetAlert = async (user, budgetStatus) => {
  const { category, spent, limit, percentUsed, isOverBudget } = budgetStatus;

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: isOverBudget
      ? `You're over budget on ${category}`
      : `Budget alert: ${category} is at ${percentUsed}%`,
    html: `
      <p>Hi ${user.name},</p>
      <p>You've spent $${spent.toFixed(2)} of your $${limit.toFixed(2)} budget
      for <strong>${category}</strong> this period (${percentUsed}%).</p>
    `,
  });
};

// Fired weekly by jobs/weeklysummary.js
const sendWeeklySummary = async (user, summary) => {
  const rows = summary.byCategory
    .map((c) => `<li>${c.category}: $${c.total.toFixed(2)}</li>`)
    .join('');

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Your weekly spending summary`,
    html: `
      <p>Hi ${user.name}, here's what you spent this week:</p>
      <p><strong>Total: $${summary.total.toFixed(2)}</strong></p>
      <ul>${rows}</ul>
    `,
  });
};

export default { sendBudgetAlert, sendWeeklySummary };