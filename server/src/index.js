import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import auth from './routes/auth.js';
import expenses from './routes/expenses.js';
import budgets from './routes/budgets.js';
import insights from './routes/insights.js';

dotenv.config();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_, res) => res.json({ ok: true, name: 'SpendWise AI Pro', storage: 'local-json' }));
app.use('/api/auth', auth);
app.use('/api/expenses', expenses);
app.use('/api/budgets', budgets);
app.use('/api/insights', insights);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`SpendWise API: http://localhost:${port}`));
