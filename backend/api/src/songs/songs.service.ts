import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import * as fs from 'fs';
import { parse } from 'csv-parse';
import * as path from 'path';

@Injectable()
export class SongsService {
  private readonly logger = new Logger(SongsService.name);

  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  // להצגת הטבלה (כמו שהיה)
  async findAll() {
    const q = await this.pool.query(
      'SELECT id, title, band FROM songs ORDER BY LOWER(band), LOWER(title)'
    );
    return q.rows;
  }

  // בדיקת בריאות (כמו שהיה)
  async healthDb() {
    const q = await this.pool.query('SELECT 1 AS ok');
    return { ok: q.rows[0].ok };
  }

  // ---------- חדש: טעינת CSV -> המרה ל-lowercase -> שמירה ל-DB ----------
  private normalize(s: string) {
    return (s ?? '').toString().trim().toLowerCase();
  }

  /**
   * קורא את data/song_list.csv, ממיר לאותיות קטנות, ומכניס ל-DB.
   * אפשר לקרוא בלי פרמטרים: importFromCsv()
   */
  async importFromCsv(csvPath = 'data/song_list.csv') {
    this.logger.log(`Importing songs from ${csvPath} ...`);
  // אם הנתיב שקיבלנו קיים – נשתמש בו (זה טוב ל-Docker: data/song_list.csv בתוך הקונטיינר)
  // אם לא – ננסה את הנתיב היחסי מה-WS המקומי: ../../data/song_list.csv
  const fallback = path.resolve(process.cwd(), '..', '..', 'data', 'song_list.csv');
  const resolvedPath = fs.existsSync(csvPath) ? csvPath : fallback;
  this.logger.log(`Using CSV path: ${resolvedPath}`);
    const stream = fs.createReadStream(resolvedPath);
    const parser = stream.pipe(
          parse({
        // CSV שלך מופרד בנקודה־פסיק
        delimiter: ';',
        // חשוב! יש קבצים עם BOM בתחילת השורה הראשונה
        bom: true,
        // נרמול שמות הכותרות: "Song Name" -> "song_name"
        columns: (header: string[]) =>
          header.map((h) => h.trim().toLowerCase().replace(/\s+/g, '_')),
        trim: true,
        skip_empty_lines: true,
      })
    );

    await this.pool.query('BEGIN');
    try {
      let inserted = 0;   
      for await (const row of parser) {
        const band = this.normalize(row.band);
        const title = this.normalize(row.song_name ?? row.title);

        // דילוג על שורות ריקות/חסרות
        if (!title || !band) continue;

        await this.pool.query(
          `INSERT INTO songs (band, title)
           VALUES ($1, $2)
           ON CONFLICT (band, title) DO NOTHING;`,
          [band, title],
        );
        inserted++; 
      }
      await this.pool.query('COMMIT');
      this.logger.log(`Import completed. Inserted rows: ${inserted}`);
      return { ok: true };
    } catch (e) {
      await this.pool.query('ROLLBACK');
      this.logger.error('Import failed', e);
      throw e;
    }
  }
  // מרוקן את הטבלה ומייבא מחדש מה-CSV (הייבוא כבר עושה lowercase)
async resetAndReimport(csvPath = 'data/song_list.csv') {
  // מרוקנים וגם מאפסים את המונה של ה-id
  await this.pool.query('TRUNCATE TABLE songs RESTART IDENTITY;');

  // מייבאים מחדש (הפונקציה הזאת כבר עושה toLowerCase+trim)
  return this.importFromCsv(csvPath);
}

}
