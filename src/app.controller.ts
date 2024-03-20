import { Public } from './modules/auth/common';
import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class AppController {
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async main(@Res() response: Response) {
    return response.status(HttpStatus.OK).json({
      message: 'OK ✅',
    });
  }
}
