import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

import {
  JwtStrategy,
  LocalStrategy,
  GoogleStrategy,
  SessionSerializer,
} from './common';
import { COOKIE_MAX_AGE } from './common/constants';

import connectPgSimple from 'connect-pg-simple';
import session from 'express-session';
import passport from 'passport';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: {
        expiresIn: COOKIE_MAX_AGE,
        algorithm: 'HS384',
      },
      verifyOptions: {
        algorithms: ['HS384'],
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt', session: true }),
  ],
  providers: [
    AuthService,
    UsersService,
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    SessionSerializer,
  ],
  controllers: [AuthController],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          secret: process.env.JWT_SECRET_KEY,
          resave: false,
          saveUninitialized: false,
          store:
            process.env.NODE_ENV === 'production'
              ? new (connectPgSimple(session))({
                  createTableIfMissing: true,
                })
              : new session.MemoryStore(),
          cookie: {
            httpOnly: true,
            // signed: true,
            path: '/',
            domain: '.vercel.app',
            sameSite: 'none',
            secure: process.env.NODE_ENV === 'production',
            maxAge: COOKIE_MAX_AGE,
          },
        }),
        passport.initialize(),
        passport.session(),
      )
      .forRoutes('*');
  }
}
