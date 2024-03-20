import { INestApplication, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import connectPgSimple from 'connect-pg-simple'; // use * as connectPgSimple for local
import cookieParser from 'cookie-parser'; // use * as cookieParser for local
import bodyParser from 'body-parser'; // use * as bodyParser for local
import session from 'express-session'; // use * as session for local
import helmet from 'helmet';

import { AppModule } from './app.module';

import { COOKIE_MAX_AGE } from './modules/auth/common/constants';

export function setup(app: INestApplication): INestApplication {
  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:3000',
      `${process.env.FRONTEND_BASE_URL}`,
    ],
    exposedHeaders: ['Authorization'],
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

  app.use(
    session({
      secret: process.env.JWT_SECRET_KEY,
      resave: false,
      saveUninitialized: false,
      store:
        process.env.NODE_ENV === 'production'
          ? new (connectPgSimple(session))()
          : new session.MemoryStore(),
      cookie: {
        httpOnly: true,
        signed: true,
        sameSite: 'none',
        secure: process.env.NODE_ENV === 'production',
        maxAge: COOKIE_MAX_AGE,
      },
    }),
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  return app;
}
