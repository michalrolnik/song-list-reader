import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class SongsService {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async findAll() {
    const q = await this.pool.query(
      'SELECT id, title, band FROM songs ORDER BY LOWER(band), LOWER(title)'
    );
    return q.rows;
  }

  async healthDb() {
    const q = await this.pool.query('SELECT 1 AS ok');
    return { ok: q.rows[0].ok };
  }
}
