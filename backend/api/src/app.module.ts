import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { SongsModule } from './songs/songs.module';
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DbModule,SongsModule],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule {}
