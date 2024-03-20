import { Module } from '@nestjs/common';
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
export class AuthModule {}
