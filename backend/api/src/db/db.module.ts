//משמיש את הבריכה שתהיה נגישה להזרקה בשאר בפרויקט 
import { Module } from '@nestjs/common';
import { pgPool } from './pg.provider';

@Module({
  providers: [
    { provide: 'PG_POOL', useValue: pgPool },
  ],
  exports: ['PG_POOL'],
})
export class DbModule {}
