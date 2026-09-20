import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import auth from './routes/auth.js';
import expenses from './routes/expenses.js';
import budgets from './routes/budgets.js';
import insights from './routes/insights.js';

dotenv.config();
const app = express();

// Production CORS fix - All origins & headers allowed
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));

// Pre-flight OPTIONS handling
app.options('*', cors());

// Health Check Route
app.get('/api/health', (_, res) => 
  res.json({ ok: true, name: 'SpendWise AI Pro', storage: 'local-json' })
);

// Root Route
app.get('/', (_, res) => 
  res.json({ ok: true, message: 'SpendWise API is live!' })
);

// API Routes
app.use('/api/auth', auth);
app.use('/api/expenses', expenses);
app.use('/api/budgets', budgets);
app.use('/api/insights', insights);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`SpendWise API running on port ${port}`));