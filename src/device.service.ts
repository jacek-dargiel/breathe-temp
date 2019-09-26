import { singleton } from 'tsyringe';
import { defer } from 'rxjs';
import * as miio from 'miio';
import { fromEvent, throwError } from 'rxjs';
import { switchMap, map, timeout, catchError, share } from 'rxjs/operators';
import * as config from './config';

@singleton()
export class DeviceService {
  public device$ = defer(() => miio.device(({
    address: config.DEVICE_ADDRESS,
    token: process.env.MI_DEVICE_TOKEN,
  }))).pipe(
    share()
  );

  public temperature$ = this.monitor<Temperature>('temperatureChanged')
    .pipe(
      map(measurment => measurment.value)
    );

  public pm2_5$ = this.monitor<number>('pm2.5Changed');

  public monitor<T>(eventName: string) {
    return this.device$.pipe(
      switchMap(device => fromEvent<[T, Device]>(device, eventName)
        .pipe(
          map(([measurment]) => measurment),
          timeout(config.MEASURMENT_TIMEOUT),
          catchError(error => {
            error.device = device;
            return throwError(error);
          })
        )
      )
    )
  }
}
