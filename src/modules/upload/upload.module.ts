import { Module } from '@nestjs/common';

import { UploadController } from './controllers';
import { UploadService } from './services';

@Module({
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
