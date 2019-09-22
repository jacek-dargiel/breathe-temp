import { singleton } from 'tsyringe';
import { DeviceService } from './device.service';
import { throwError, Observable, combineLatest } from 'rxjs';
import { catchError, bufferTime, map, filter, tap } from 'rxjs/operators';
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
    combineLatest(
      this.device.temperature$.pipe(
        this.averageOverTime(),
        tap(value => this.logger.log('home-temperature', toFixed(value, 2))),
      ),
      this.device.aqi$.pipe(
        this.averageOverTime(),
        tap(value => this.logger.log('home-aqi', toFixed(value, 2))),
      ),
    )
      .pipe(
        catchError(error => {
          console.error('Error. Will reconnect with exponential backoff.', error);
          error.device && error.device.destroy();
          return throwError(error)
        }),
        retryBackoff(config.BACKOFF_TIME),
      )
      .subscribe();
  }

  private averageOverTime(time = config.AVERAGING_TIME) {
    return (source$: Observable<number>) => {
      return source$.pipe(
        bufferTime(time),
        filter(values => values.length > 0),
        map(values => sum(values)/values.length)
      )
    }
  }

}
