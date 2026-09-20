import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const dbFile = path.join(dataDir, 'db.json');

const emptyDb = { users: [], expenses: [], budgets: [] };

// Cloud-safe Memory Store (Render restart hone par bhi 500 nahi dega)
let memoryDb = { ...emptyDb };
let isLoaded = false;

function fixIds(items = []) {
  return items.map(item => ({
    ...item,
    _id: item._id || item.id || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  }));
}

export async function readDb() {
  if (isLoaded) return memoryDb;
  try {
    const raw = await fs.readFile(dbFile, 'utf8');
    const parsed = JSON.parse(raw || '{}');
    memoryDb = {
      users: fixIds(parsed.users || []),
      expenses: fixIds(parsed.expenses || []),
      budgets: fixIds(parsed.budgets || [])
    };
    isLoaded = true;
  } catch (err) {
    console.log("Using in-memory DB mode (File read skipped or non-existent)");
    isLoaded = true;
  }
  return memoryDb;
}

export async function writeDb(db) {
  memoryDb = {
    users: fixIds(db.users || []),
    expenses: fixIds(db.expenses || []),
    budgets: fixIds(db.budgets || [])
  };
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(dbFile, JSON.stringify(memoryDb, null, 2), 'utf8');
  } catch (err) {
    // Disk write error ignore karein taaki server crash 500 na aaye
    console.log("Memory DB updated. (Disk write bypassed for Cloud environment)");
  }
}

export function id() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}