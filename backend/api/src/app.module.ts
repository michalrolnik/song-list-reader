import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { SongsModule } from './songs/songs.module';
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DbModule,SongsModule],
 

})
export class AppModule {}
