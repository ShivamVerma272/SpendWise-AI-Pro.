import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readDb, writeDb, id } from '../store.js';

const r = Router();

const token = (u) =>
  jwt.sign(
    {
      id: u.id,
      name: u.name,
      email: u.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );

// Register
r.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({
        message: 'Name, email and 6+ character password are required',
      });
    }

    const db = await readDb();

    const normalized = String(email).trim().toLowerCase();

    if (db.users.some((u) => u.email === normalized)) {
      return res.status(409).json({
        message: 'Email already registered',
      });
    }

    const u = {
      id: id(),
      name: String(name).trim(),
      email: normalized,
      password: await bcrypt.hash(password, 10),
      createdAt: new Date().toISOString(),
    };

    db.users.push(u);

    await writeDb(db);

    res.status(201).json({
      token: token(u),
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
      },
    });
  } catch (e) {
    console.error('REGISTER ERROR:', e);

    res.status(500).json({
      message: 'Server error',
      error: e.message,
    });
  }
});

// Login
r.post('/login', async (req, res) => {
  try {
    const db = await readDb();

    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();

    const u = db.users.find((x) => x.email === email);

    if (
      !u ||
      !(await bcrypt.compare(req.body?.password || '', u.password))
    ) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    res.json({
      token: token(u),
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
      },
    });
  } catch (e) {
    console.error('LOGIN ERROR:', e);

    res.status(500).json({
      message: 'Server error',
      error: e.message,
    });
  }
});

export default r;