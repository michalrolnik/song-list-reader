import { Injectable } from '@nestjs/common';

// בפרויקט לא עושה באמת כלום 


@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
