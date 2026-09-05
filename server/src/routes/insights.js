import { Router } from 'express';
import auth from '../middleware/auth.js';
import { readDb } from '../store.js';

const r = Router(); r.use(auth);

function fallback(rows, budget) {
  const total = rows.reduce((s, x) => s + Number(x.amount || 0), 0), by = {};
  rows.forEach(x => by[x.category] = (by[x.category] || 0) + Number(x.amount || 0));
  const top = Object.entries(by).sort((a, b) => b[1] - a[1])[0];
  const tips = [], risks = [], plan = [];
  if (top) tips.push(`${top[0]} is your largest category at ₹${top[1].toFixed(0)}.`);
  if (budget && total > budget) { risks.push(`You are ₹${(total - budget).toFixed(0)} over this month's budget.`); tips.push('Review non-essential expenses and set a smaller weekly limit.'); }
  else if (budget) tips.push(`You have ₹${Math.max(budget - total, 0).toFixed(0)} remaining in your monthly budget.`);
  if (rows.length >= 5) tips.push('Review recurring subscriptions and high-frequency small purchases once a week.');
  if (top) plan.push(`Review your ${top[0]} spending and identify one expense to reduce.`);
  plan.push('Check your spending at the end of each week and adjust the next week’s limit.');
  return { summary: `You tracked ₹${total.toFixed(0)} across ${rows.length} expenses.`, tips, risks, plan, provider: 'local' };
}

r.get('/', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const db = await readDb();
    const rows = db.expenses.filter(x => x.userId === req.user.id && String(x.date).slice(0, 7) === month).sort((a, b) => new Date(a.date) - new Date(b.date));
    const b = db.budgets.find(x => x.userId === req.user.id && x.month === month);
    const base = fallback(rows, b?.amount || 0);
    if (!process.env.GEMINI_API_KEY) return res.json(base);
    try {
      const prompt = `You are a practical personal finance assistant. Analyze this user's monthly expense data. Do not give regulated investment/tax advice. Return ONLY valid JSON with keys summary (string), tips (array of 3-5 concise strings), risks (array of 0-3 strings), plan (array of 2-4 strings). Budget: ${b?.amount || 0}. Expenses: ${JSON.stringify(rows.map(x => ({title:x.title,amount:x.amount,category:x.category,date:x.date,merchant:x.merchant})))}.`;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const rr = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:'application/json'}}) });
      if (!rr.ok) throw Error('AI provider error');
      const data = await rr.json(); const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(text); res.json({...parsed, provider:'gemini'});
    } catch { res.json({...base, provider:'local-fallback'}); }
  } catch (e) { res.status(500).json({ message: 'Could not generate insights' }); }
});

export default r;
