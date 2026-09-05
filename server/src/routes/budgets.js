import { Router } from 'express';
import auth from '../middleware/auth.js';
import { readDb, writeDb, id } from '../store.js';

const r = Router(); r.use(auth);

r.get('/:month', async (req, res) => {
  const db = await readDb();
  res.json(db.budgets.find(x => x.userId === req.user.id && x.month === req.params.month) || null);
});

r.put('/:month', async (req, res) => {
  try {
    const amount = Number(req.body?.amount);
    if (!Number.isFinite(amount) || amount < 0) return res.status(400).json({ message: 'Budget must be a valid non-negative number' });
    const db = await readDb();
    const i = db.budgets.findIndex(x => x.userId === req.user.id && x.month === req.params.month);
    const item = { id: i >= 0 ? db.budgets[i].id : id(), userId: req.user.id, month: req.params.month, amount, updatedAt: new Date().toISOString() };
    if (i >= 0) db.budgets[i] = item; else db.budgets.push(item);
    await writeDb(db); res.json(item);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

export default r;
