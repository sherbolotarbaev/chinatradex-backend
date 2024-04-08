import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: User, done: (err: Error | null, payload?: User) => void) {
    delete user.password;
    delete user.resetPasswordToken;
    delete user.verificationToken;
    done(null, user);
  }

  deserializeUser(
    user: User,
    done: (err: Error | null, payload?: User) => void,
  ) {
    delete user.password;
    delete user.resetPasswordToken;
    delete user.verificationToken;
    done(null, user);
  }
}
