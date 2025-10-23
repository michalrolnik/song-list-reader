import { Controller, Get, HttpCode,Query } from '@nestjs/common';
import { SongsService } from './songs.service';

@Controller()
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get('health/db')
  health() {
    return this.songsService.healthDb();
  }

  @Get('songs')
  songs() {
    return this.songsService.findAll();
  }

  @Get('songs/cursor')
  async listCursor(
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string
  ) {
    const l = Math.min(Math.max(Number(limit) || 50, 1), 200);
    return this.songsService.listByCursor(l, cursor || undefined);
  }

  // חדש: ייבוא ה־CSV -> lowercase -> DB
  @Get('songs/import')
  @HttpCode(202)
  importCsv() {
    return this.songsService.importFromCsv();
  }
  // GET /songs/reset — מרוקן ואז מייבא מחדש (הכול יישמר lowercase)
  @Get('songs/reset')
  @HttpCode(202)
  resetAndReimport() {
    return this.songsService.resetAndReimport();
  }

}

