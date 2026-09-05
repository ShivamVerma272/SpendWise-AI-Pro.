import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const dbFile = path.join(dataDir, 'db.json');

const emptyDb = { users: [], expenses: [], budgets: [] };

async function ensureDb() {
  await fs.mkdir(dataDir, { recursive: true });
  try { await fs.access(dbFile); }
  catch { await fs.writeFile(dbFile, JSON.stringify(emptyDb, null, 2)); }
}

export async function readDb() {
  await ensureDb();
  const raw = await fs.readFile(dbFile, 'utf8');
  return { ...emptyDb, ...JSON.parse(raw || '{}') };
}

export async function writeDb(db) {
  await ensureDb();
  await fs.writeFile(dbFile, JSON.stringify(db, null, 2), 'utf8');
}

export function id() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
