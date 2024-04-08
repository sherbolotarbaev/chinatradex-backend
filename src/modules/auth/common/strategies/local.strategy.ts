import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../../services';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'emailOrUsername',
      passReqToCallback: false,
    });
  }

  async validate(emailOrUsername: string, password: string) {
    return await this.authService.login({
      emailOrUsername,
      password,
    });
  }
}
