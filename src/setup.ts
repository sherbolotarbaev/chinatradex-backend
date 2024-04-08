import { INestApplication, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';

export function setup(app: INestApplication): INestApplication {
  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: ['http://localhost:3000', `${process.env.FRONTEND_BASE_URL}`],
    exposedHeaders: ['Authorization', 'Cookie'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.use(cookieParser(process.env.APP_SECRET));

  app.use(
    bodyParser.urlencoded({
      extended: true,
      limit: '10mb',
    }),
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  return app;
}
