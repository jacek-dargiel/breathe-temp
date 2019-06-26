import 'core-js/features/reflect';
import { container } from "tsyringe";

import { AppController } from './app.controller';

container.resolve(AppController);
