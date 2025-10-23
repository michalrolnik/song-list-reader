// src/index.js
// טעינה מהדאטה בייס


import express, { Request, Response } from "express";
import cors from 'cors';
import { pool } from './db';

interface Song { id: number; title: string; band: string; }
const app = express();
app.use(cors());


app.get('/songs', async (_req: Request, res: Response) => {
  try {
     const sql = `SELECT id, title, band FROM songs ORDER BY LOWER(band), LOWER(title)`;
      const q = await pool.query<Song>(sql);
      res.json(q.rows);
    
    
  } catch (e:unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error(err.message);
    res.status(500).json({ error: 'failed to fetch songs' });
  }
});

// health
app.get('/health/db', async (_req: Request, res: Response) => {
  try {
     const r = await pool.query<{ ok: number }>('SELECT 1 AS ok');
     res.json({ ok: r.rows[0].ok });
  } catch (e:unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error('DB health error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT? Number(process.env.PORT): 3000;
app.listen(PORT, () => console.log(`backend listening on ${PORT}`)
);
