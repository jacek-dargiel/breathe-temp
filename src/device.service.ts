import { singleton } from 'tsyringe';
import { defer } from 'rxjs';
import * as miio from 'miio';
import { fromEvent, throwError } from 'rxjs';
import { switchMap, map, timeout, catchError } from 'rxjs/operators';

@singleton()
export class DeviceService {
  public device$ = defer(() => miio.device(({
    address: '192.168.1.204',
    token: '1234abcd',
  })));
  public temperature$ = this.device$.pipe(
    switchMap((device) => {
      return fromEvent<[Temperature, Device]>(device, 'temperatureChanged')
        .pipe(
          map(([temp]) => temp.value),
          timeout(600000),
          catchError(error => {
            error.device = device;
            return throwError(error)
          })
        )
    })
  );
}
