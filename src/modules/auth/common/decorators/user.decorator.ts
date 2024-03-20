import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const User = createParamDecorator(
  (data: keyof User, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest<Request>().user as User;

    return data ? user && user[data] : user;
  },
);
