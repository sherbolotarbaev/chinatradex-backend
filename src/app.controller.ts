import { Public, Ip } from './modules/auth/common';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { getLocation } from './utils';
import moment from 'moment';
import 'moment-timezone';

@Controller()
export class AppController {
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async main(@Res() response: Response) {
    return response.status(HttpStatus.OK).json({
      message: 'OK',
    });
  }

  @Public()
  @Get('ping')
  @HttpCode(HttpStatus.OK)
  async ping(
    @Ip() ip: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    let platform = request.headers['sec-ch-ua-platform']
      ? request.headers['sec-ch-ua-platform'].toString()
      : null;

    if (platform) {
      platform = platform.replace(/"/g, '');
    }

    const location = await getLocation(ip);

    return response.status(HttpStatus.OK).json({
      ip,
      platform,
      ...location,
      time: moment().tz(location.timezone).format('DD.MM.YYYY HH:mm:ss'),
    });
  }
}
