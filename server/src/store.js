import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const dbFile = path.join(dataDir, 'db.json');

const emptyDb = { users: [], expenses: [], budgets: [] };
let memoryDb = { ...emptyDb };

async function ensureDb() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    try { 
      await fs.access(dbFile); 
    } catch { 
      await fs.writeFile(dbFile, JSON.stringify(emptyDb, null, 2), 'utf8'); 
    }
  } catch (err) {
    console.error("Directory creation or access failed:", err);
  }
}

// id aur _id dono support karne ke liye helper function
function fixIds(items = []) {
  return items.map(item => ({
    ...item,
    _id: item._id || item.id || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  }));
}

export async function readDb() {
  try {
    await ensureDb();
    const raw = await fs.readFile(dbFile, 'utf8');
    const parsed = JSON.parse(raw || '{}');
    memoryDb = {
      users: fixIds(parsed.users || []),
      expenses: fixIds(parsed.expenses || []),
      budgets: fixIds(parsed.budgets || [])
    };
    return memoryDb;
  } catch (err) {
    console.error("readDb error, using memory fallback:", err);
    return memoryDb;
  }
}

export async function writeDb(db) {
  try {
    memoryDb = db;
    await ensureDb();
    await fs.writeFile(dbFile, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error("writeDb error:", err);
  }
}

export function id() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
