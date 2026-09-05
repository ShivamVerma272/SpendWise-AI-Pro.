import { Router } from 'express';
import auth from '../middleware/auth.js';
import { readDb, writeDb, id } from '../store.js';

const r = Router(); r.use(auth);
const matchesMonth = (date, month) => String(date).slice(0, 7) === month;

r.get('/', async (req, res) => {
  const db = await readDb();
  let rows = db.expenses.filter(x => x.userId === req.user.id);
  if (req.query.category && req.query.category !== 'All') rows = rows.filter(x => x.category === req.query.category);
  if (req.query.month) rows = rows.filter(x => matchesMonth(x.date, req.query.month));
  if (req.query.search) {
    const s = req.query.search.toLowerCase();
    rows = rows.filter(x => `${x.title} ${x.merchant || ''} ${x.note || ''}`.toLowerCase().includes(s));
  }
  rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(rows);
});

r.post('/', async (req, res) => {
  try {
    const { title, amount, category, date, merchant = '', note = '' } = req.body || {};
    if (!title || !Number.isFinite(Number(amount)) || Number(amount) < 0 || !category || !date)
      return res.status(400).json({ message: 'Title, valid amount, category and date are required' });
    const db = await readDb();
    const x = { id: id(), userId: req.user.id, title: String(title).trim(), amount: Number(amount), category, date: new Date(date).toISOString(), merchant: String(merchant), note: String(note), createdAt: new Date().toISOString() };
    db.expenses.push(x); await writeDb(db); res.status(201).json(x);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

r.put('/:id', async (req, res) => {
  try {
    const db = await readDb();
    const i = db.expenses.findIndex(x => x.id === req.params.id && x.userId === req.user.id);
    if (i < 0) return res.status(404).json({ message: 'Expense not found' });
    const current = db.expenses[i];
    const next = { ...current, ...req.body };
    next.amount = Number(next.amount);
    next.date = new Date(next.date).toISOString();
    if (!next.title || !Number.isFinite(next.amount) || next.amount < 0 || !next.category || !next.date) return res.status(400).json({ message: 'Invalid expense data' });
    db.expenses[i] = next; await writeDb(db); res.json(next);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

r.delete('/:id', async (req, res) => {
  const db = await readDb();
  const before = db.expenses.length;
  db.expenses = db.expenses.filter(x => !(x.id === req.params.id && x.userId === req.user.id));
  if (db.expenses.length === before) return res.status(404).json({ message: 'Expense not found' });
  await writeDb(db); res.json({ ok: true });
});

export default r;
