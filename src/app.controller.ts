import { singleton } from 'tsyringe';
import { DeviceService } from './device.service';
import { fromEvent, throwError } from 'rxjs';
import { switchMap, map, catchError, retry, timeout } from 'rxjs/operators';
import { retryBackoff } from 'backoff-rxjs';
import { AIOClient } from './aio-client.service';

interface Temperature {
  value: number;
  unit: string;
}
@singleton()
export class AppController {
  constructor(
    private device: DeviceService,
    private aioClient: AIOClient,
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
      .subscribe(temperature => {
        console.log(temperature);
        this.aioClient.post(`/feeds/home-temperature/data`, { value: temperature, created_at: new Date() })
          .pipe(
            retry(3)
          )
          .subscribe({
            error(error) {
              console.log('Failed to log temperature to AIO.', { status: error.response.status, data: error.response.data});
            }
          });
      });

  }
}
