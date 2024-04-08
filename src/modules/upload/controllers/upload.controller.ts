import {
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UploadService } from '../services';

import { SessionAuthGuard, JWTAuthGuard, User } from '../../auth/common';

@Controller('upload')
@UseGuards(SessionAuthGuard, JWTAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Put('photo')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @User() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.uploadService.uploadPhoto(user, file);
  }
}
