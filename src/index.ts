import 'core-js/features/reflect';
import { container } from "tsyringe";
import { default as dotenv } from 'dotenv';

import { AppController } from './app.controller';

dotenv.config();

if (!process.env.AIO_KEY || !process.env.MI_DEVICE_TOKEN) {
  throw new Error('Missing environment variables. Make a new `.env` file based on `.env.example` file.')
}

container.resolve(AppController);
