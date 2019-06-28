import { singleton } from 'tsyringe';
import { DeviceService } from './device.service';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { retryBackoff } from 'backoff-rxjs';
import { LoggerService } from './logger.service';

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
        retryBackoff(10000)
      )
      .subscribe(temperature => {
        this.logger.log(temperature);
      });
  }

}
