import { Controller, Get } from '@nestjs/common';
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
}
