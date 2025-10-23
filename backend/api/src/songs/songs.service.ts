import {
  Inject,
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SongEntity } from './song.entity';


import { Pool } from 'pg';
import * as fs from 'fs';
import { parse } from 'csv-parse';
import * as path from 'path';
import { encodeCursor,decodeCursor } from './cursor';
@Injectable()
export class SongsService {
  private readonly logger = new Logger(SongsService.name);

  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}


  // Cursor / Keyset - מצביע על השיר האחרון שמוצג ללקוח כדי לדעת מאיזה שירה להמישל לטעון  מהדאטה בייס
  async listByCursor(limit = 50, cursor?: string) {
    const safe = Math.min(Math.max(limit, 1), 200);
    const c = decodeCursor(cursor);
    const params: any[] = [];
    let where = '';

    if (c) {
      params.push(c.band, c.title, c.id);
      where = 'WHERE (band, title, id) > ($1, $2, $3)';
    }

    // LIMIT+1 כדי לדעת אם יש עוד
    const res = await this.pool.query(
      `
      SELECT id, band, title
      FROM songs
      ${where}
      ORDER BY band, title, id
      LIMIT ${safe + 1}
      `,
      params,
    );

    const rows = res.rows;
    const hasMore = rows.length > safe;
    const items = hasMore ? rows.slice(0, safe) : rows;
    const last = items[items.length - 1] || null;

    return {
      items,
      nextCursor: last ? encodeCursor({ band: last.band, title: last.title, id: last.id }) : null,
      hasMore,
      limit: safe,
    };
  }


  // להצגת הטבלה (כמו שהיה)
  async findAll(): Promise<SongEntity[]> {
    try{
    const q = await this.pool.query(
      'SELECT id, title, band FROM songs ORDER BY band, title, id'); 
        return q.rows    }
      catch(err: any){  if (err?.code === '42P01') { // table not found
        throw new ServiceUnavailableException('Songs table is missing');
      }
      throw new InternalServerErrorException('Failed to fetch songs');
    }
  }

   
  

  // בדיקת בריאות (כמו שהיה)
  async healthDb() {
    try {
      const q = await this.pool.query('SELECT 1 AS ok');
      return { ok: q.rows[0].ok };
    } catch {
      // לבריאות לא חושפים פרטים
      throw new ServiceUnavailableException('DB not reachable');
    }
  }

  
  private normalize(s: string) {
    return (s ?? '').toString().trim().toLowerCase();
  }

  
   //* DBקורא את קובץ השירים, ממיר לאותיות קטנות ומכניס ל
async importFromCsv(csvPath = 'data/song_list.csv',manageTx = true) {
  this.logger.log(`Importing songs from ${csvPath} ...`);

  
  let stream: fs.ReadStream | null=null;


  try {
    // אם הנתיב שקיבלנו קיים – נשתמש בו (טוב ל-Docker: data/song_list.csv בתוך הקונטיינר)
  // אם לא – ננסה את הנתיב היחסי מה-WS המקומי: ../../data/song_list.csv
  const fallback = path.resolve(process.cwd(), '..', '..', 'data', 'song_list.csv');
  const resolvedPath = fs.existsSync(csvPath) ? csvPath : fallback;
  this.logger.log(`Using CSV path: ${resolvedPath}`);

      
    stream = fs.createReadStream(resolvedPath);
    const parser = stream.pipe(
      parse({
        // ה-CSV מופרד בנקודה-פסיק
        delimiter: ';',
        // לטיפול בקבצים עם BOM בתחילת הקובץ
        bom: true,
        // נרמול שמות כותרות: "Song Name" -> "song_name"
        columns: (header: string[]) =>
          header.map((h) => h.trim().toLowerCase().replace(/\s+/g, '_')),
        trim: true,
        skip_empty_lines: true,
      })
      
    );
    if (manageTx) {
          await this.pool.query('BEGIN');
        }

    let inserted = 0;

    // עוטפים את הצריכה של ה-parser בהבטחה שתיפול גם על error של stream/parser
    await new Promise<void>((resolve, reject) => {
      (async () => {
        try {
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
          resolve();
        } catch (loopErr) {
          reject(loopErr);
        }
      })();

      // מאזינים לשגיאות אסינכרוניות של הקריאה/פענוח
      if (stream) {
        stream.on('error', reject);
      }
      parser.on('error', reject);
    });

    if (manageTx) {
          await this.pool.query('COMMIT');
        } 
    this.logger.log(`Import completed. Inserted rows: ${inserted}`);
    return { ok: true, inserted };
  } catch (e: any) {
    // קודם מגלגלים אחורה את הטרנזקציה (גם אם זה עצמו ייכשל – לא מפילים את התשובה)
    if (manageTx) {
          try { await this.pool.query('ROLLBACK'); } catch {}
        }
    // מיפוי שגיאות קריאות ללקוח
    if (e?.code === 'ENOENT') {
      throw new BadRequestException('CSV file not found');
    }
    if (e?.code === '22P02') {
      throw new BadRequestException('Invalid CSV data');
    }

    this.logger.error('Import failed', e);
    throw new InternalServerErrorException('Failed to import CSV');
  }
   finally {
  try {
    stream?.destroy(); // אם נפתח stream, נסגור אותו
  } catch {}
}

}


async resetAndReimport(csvPath = 'data/song_list.csv') {

  try {
    //כל הפקודות שכתובות בין השורה הזאת לזו של COMMIT יבוצעו זמנית
    // אם משהו מבין ה AWAITS לא יקרה אז כל הבלוק הזה לא יקרה
    //דואג לאטומיות
    await this.pool.query('BEGIN');
    //מוחק את כל השורות בDB
    await this.pool.query('TRUNCATE TABLE songs RESTART IDENTITY;');

    // מייבאים מחדש (הפונקציה הזאת כבר עושה toLowerCase+trim)
    await this.importFromCsv(csvPath, false); 
    await this.pool.query('COMMIT');
    return { ok: true };
  } catch (e) {
    try { await this.pool.query('ROLLBACK'); } catch {}
    throw new InternalServerErrorException('Failed to reset and reimport');
  }
}


 
  
}

