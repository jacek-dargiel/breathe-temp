import { singleton } from 'tsyringe';

@singleton()
export class AppController {
  constructor() {
    console.log('AppController');
  }
}
