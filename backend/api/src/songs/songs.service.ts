import {
  Inject,
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';


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
    try{
    const q = await this.pool.query(
      'SELECT id, title, band FROM songs ORDER BY LOWER(band), LOWER(title)'); 
      return q.rows;
    }
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

  // אם הנתיב שקיבלנו קיים – נשתמש בו (טוב ל-Docker: data/song_list.csv בתוך הקונטיינר)
  // אם לא – ננסה את הנתיב היחסי מה-WS המקומי: ../../data/song_list.csv
  const fallback = path.resolve(process.cwd(), '..', '..', 'data', 'song_list.csv');
  const resolvedPath = fs.existsSync(csvPath) ? csvPath : fallback;
  this.logger.log(`Using CSV path: ${resolvedPath}`);

  let stream: fs.ReadStream | null=null;


  try {
      

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

