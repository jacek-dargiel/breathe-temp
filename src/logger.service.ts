import { singleton } from 'tsyringe';
import { retry } from 'rxjs/operators'

import { AIOClient } from './aio-client.service';
import * as config from './config'

@singleton()
export class LoggerService {
  constructor(
    private aioClient: AIOClient,
  ) {}
  public log(feed: string, value: number, date = new Date()) {
    console.log({feed, value, date});
    this.aioClient.post(`/feeds/${feed}/data`, { value: value, created_at: date })
      .pipe(
        retry(config.LOG_RETRY_COUNT)
      )
      .subscribe({
        error(error) {
          console.log('Failed to log temperature to AIO.', { status: error.response.status, data: error.response.data});
        }
      });
  }
}
