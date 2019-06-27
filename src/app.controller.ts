import { singleton } from 'tsyringe';
import { DeviceService } from './device.service';
import { fromEvent, concat, throwError } from 'rxjs';
import { switchMap, tap, map, catchError, retry, timeout } from 'rxjs/operators';
import { retryBackoff } from 'backoff-rxjs';

interface Temperature {
  value: number;
  unit: string;
}
@singleton()
export class AppController {
  constructor(
    private device: DeviceService
  ) {
    console.log('Start');
    this.device.device$
      .pipe(
        switchMap((device: any) => {
          return fromEvent<[Temperature, any]>(device, 'temperatureChanged')
            .pipe(
              map(([temp]) => temp.value),
              timeout(600000),
              catchError(error => {
                error.device = device;
                return throwError(error)
              })
            )
        }),
        catchError(error => {
          console.error('Error. Will reconnect with exponential backoff.', error);
          error.device && error.device.destroy();
          return throwError(error)
        }),
        retryBackoff(10000)
      )
      .subscribe((temp) => console.log(temp));

  }
}
