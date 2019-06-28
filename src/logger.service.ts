import { singleton } from 'tsyringe';
import { retry } from 'rxjs/operators'

import { AIOClient } from './aio-client.service';

@singleton()
export class LoggerService {
  constructor(
    private aioClient: AIOClient,
  ) {}
  public log(value: number) {
    console.log(value);
    this.aioClient.post(`/feeds/home-temperature/data`, { value: value, created_at: new Date() })
      .pipe(
        retry(3)
      )
      .subscribe({
        error(error) {
          console.log('Failed to log temperature to AIO.', { status: error.response.status, data: error.response.data});
        }
      });
  }
}
