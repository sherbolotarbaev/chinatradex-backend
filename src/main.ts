import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';
import { setup } from './setup';

async function start() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT || 888;
  const logger = new Logger('NestJsApplication');

  setup(app);

  try {
    await app.listen(port);
    logger.log(`Server is running on: http://localhost:${port} ⚡️`);
  } catch (e: any) {
    logger.error(e);
    process.exit(1);
  }
}
start();
