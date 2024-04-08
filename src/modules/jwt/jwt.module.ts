import { Global, Module } from '@nestjs/common';

import { JwtService } from './services';

@Global()
@Module({
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule {}
