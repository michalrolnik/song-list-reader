// backend/src/seed.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const fs = require('fs');
const { parse } = require('csv-parse');
const { pool } = require('./db');

// אם ה-CSV מחוץ ל-backend, עדכני ב-.env לנתיב הנכון (למשל ../data/song_list.csv)
const CSV_PATH = process.env.CSV_PATH || path.join(__dirname, '..', 'data', 'song_list.csv');

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS songs (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      band  TEXT NOT NULL
    );
  `);
}

async function importCsv() {
  if (!fs.existsSync(CSV_PATH)) {
    console.log('CSV not found at', CSV_PATH);
    return;
  }

  console.log('Reading CSV from:', CSV_PATH);
  console.log('CSV size (bytes):', fs.statSync(CSV_PATH).size);

  await ensureTable();

  const rows = [];
  const parser = fs
    .createReadStream(CSV_PATH)
    .pipe(parse({
      columns: true,
      trim: true,
      skip_empty_lines: true,
      bom: true,
      // ננסה גם פסיק, גם נקודה-פסיק, גם טאב
      delimiter: [',', ';', '\t'],
      relax_column_count: true,
    }));

  for await (const rec of parser) {
    // נורמליזציה של שמות העמודות לאותיות קטנות
    const lower = Object.fromEntries(
      Object.entries(rec).map(([k, v]) => [String(k).toLowerCase().trim(), v])
    );

    // נסיונות לשמות עמודות נפוצים
   // נסיונות לשמות עמודות נפוצים
const title =
  String(
    lower['song name'] ??
    lower.song ??
    lower.title ??
    lower.name ??
    lower.track ??
    ''
  ).trim().toLowerCase();

const band =
  String(
    lower.band ??
    lower.artist ??
    lower.singer ??
    lower.group ??
    ''
  ).trim().toLowerCase();

    if (title && band) rows.push({ title, band });
  }

  console.log('Parsed rows:', rows.length);

  if (rows.length === 0) {
    console.log('Heads-up: parsed 0 rows. Tip: open the CSV and check exact column names.');
    // הצגת כמה תווים ראשונים לאבחון מהיר (לא חובה)
    const preview = fs.readFileSync(CSV_PATH, 'utf8').split(/\r?\n/).slice(0, 3).join('\n');
    console.log('File preview:\n' + preview);
    return;
  }

  // ניקוי קודם (אופציונלי)
  await pool.query('DELETE FROM songs');

  for (const r of rows) {
    await pool.query('INSERT INTO songs (title, band) VALUES ($1, $2)', [r.title, r.band]);
  }

  console.log(`Imported ${rows.length} songs`);
}

importCsv()
  .then(() => process.exit(0))
  .catch(err => { console.error(err); process.exit(1); });
