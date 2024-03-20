import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { JwtSignOptions, JwtService as NestJwtService } from '@nestjs/jwt';

import { COOKIE_MAX_AGE } from '../auth/common/constants';

@Injectable()
export class JwtService extends NestJwtService {
  constructor() {
    super();
  }

  async generateSession(userId: number) {
    return this.signAsync({ id: userId }, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: COOKIE_MAX_AGE,
      algorithm: 'HS384',
    } as JwtSignOptions);
  }

  async generateResetPasswordToken(userId: number) {
    return this.signAsync({ id: userId }, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: 60 * 2, // 2 minutes
    } as JwtSignOptions);
  }

  async compareResetPasswordToken(identificationToken: string) {
    try {
      return await this.verifyAsync(identificationToken, {
        secret: process.env.JWT_SECRET_KEY,
      });
    } catch (e: any) {
      if (e.name === 'TokenExpiredError') {
        throw new BadRequestException(
          'Срок действия ссылки для сброса пароля истек. Пожалуйста, нажмите на ссылку ниже, чтобы снова сбросить пароль.',
        );
      } else {
        throw new BadGatewayException(
          'Неверный идентификационный ключ для сброса пароля. Пожалуйста, воспользуйтесь ссылкой, чтобы сбросить пароль.',
        );
      }
    }
  }
}
