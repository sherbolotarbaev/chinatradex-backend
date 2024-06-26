import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { JwtService } from '../../../jwt/services';

import { COOKIE_MAX_AGE } from '../constants';

@Injectable()
export class SessionInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<User>,
  ): Observable<
    Promise<{
      redirectUrl: string;
    } | void>
  > {
    return next.handle().pipe(
      map(async (user) => {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();

        const session = await this.jwtService.generateSession(user.id);

        response.setHeader('Authorization', `Bearer ${session}`);
        response.cookie('session', session, {
          httpOnly: true,
          signed: true,
          path: '/',
          sameSite: 'none',
          secure: process.env.NODE_ENV === 'production',
          maxAge: COOKIE_MAX_AGE,
        });

        if (request.query.authuser) {
          return response
            .status(HttpStatus.OK)
            .redirect(
              `${
                process.env.FRONTEND_BASE_URL
              }/redirect?session=${session}&to=${request.query.next || '/'}`,
            );
        }

        return {
          redirectUrl: `/redirect?session=${session}&to=${
            request.query.next || '/'
          }`,
        };
      }),
    );
  }
}
