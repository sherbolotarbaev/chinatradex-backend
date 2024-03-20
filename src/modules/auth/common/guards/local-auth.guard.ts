import { Injectable, ExecutionContext, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';

import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { LoginDto } from '../../dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const body = plainToClass(LoginDto, request.body);
    const errors = await validate(body);
    const errorMessages = errors.flatMap(({ constraints }) =>
      Object.values(constraints),
    );

    if (errorMessages.length > 0) {
      response.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: errorMessages,
      });
    }

    return (await super.canActivate(context)) as boolean;
  }
}
