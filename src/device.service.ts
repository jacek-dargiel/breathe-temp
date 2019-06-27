import { singleton } from 'tsyringe';
import { defer } from 'rxjs';
import * as miio from 'miio';

@singleton()
export class DeviceService {
  device$ = defer(() => miio.device(({
    address: '192.168.1.204',
    token: '1234abcd',
  })));
}
