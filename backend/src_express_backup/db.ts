//connection to postgress
// חיבור לדאטה בייi 
// 
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.PGHOST ?? 'localhost',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  user: process.env.PGUSER ?? 'songuser',
  password: process.env.PGPASSWORD ?? 'songpass',
  database: process.env.PGDATABASE ?? 'songdb',
});
