import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './controllers';
import { AuthService } from './services';
import { UsersService } from '../users/services';

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
        expiresIn: '30m',
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
            signed: true,
            path: '/',
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
