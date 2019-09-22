import { singleton } from 'tsyringe';
import { DeviceService } from './device.service';
import { throwError, Observable } from 'rxjs';
import { catchError, bufferTime, map, filter } from 'rxjs/operators';
import { retryBackoff } from 'backoff-rxjs';
import { LoggerService } from './logger.service';
import * as config from './config';
import { toFixed, sum } from './helpers';

@singleton()
export class AppController {
  constructor(
    private device: DeviceService,
    private logger: LoggerService,
  ) {
    console.log('Start');
    this.device.temperature$
      .pipe(
        catchError(error => {
          console.error('Error. Will reconnect with exponential backoff.', error);
          error.device && error.device.destroy();
          return throwError(error)
        }),
        retryBackoff(config.BACKOFF_TIME),
        this.averageOverTime(config.AVERAGING_TIME),
        map(value => toFixed(value, config.AVERAGING_DIGITS)),
      )
      .subscribe(temperature => {
        this.logger.log(temperature, new Date());
      });
  }

  private averageOverTime(time: number) {
    return (source$: Observable<number>) => {
      return source$.pipe(
        bufferTime(time),
        filter(values => values.length > 0),
        map(values => sum(values)/values.length)
      )
    }
  }

}
