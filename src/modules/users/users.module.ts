import { Module } from '@nestjs/common';

import { UsersController } from './controllers';
import { UsersService } from './services';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
