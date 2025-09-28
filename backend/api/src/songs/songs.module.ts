// src/songs/songs.module.ts
import { Module } from '@nestjs/common';
import { SongsService } from './songs.service';
import { SongsController } from './songs.controller';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [SongsController],
  providers: [SongsService],
})
export class SongsModule {}
