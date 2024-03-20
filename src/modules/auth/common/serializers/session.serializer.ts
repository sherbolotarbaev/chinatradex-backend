import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: User, done: (err: Error | null, id?: User) => void) {
    delete user.password;
    done(null, user);
  }

  deserializeUser(
    payload: unknown,
    done: (err: Error | null, payload?: unknown) => void,
  ) {
    done(null, payload);
  }
}
