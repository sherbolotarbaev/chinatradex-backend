import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  AuthModule,
  JwtModule,
  PrismaModule,
  SupabaseModule,
  UploadModule,
  UsersModule,
} from './modules';

import { CacheModule } from '@nestjs/cache-manager';
import { MailerModule } from '@nestjs-modules/mailer';

import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAILER_HOST,
        port: 587,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASSWORD,
        },
      },
    }),
    AuthModule,
    JwtModule,
    PrismaModule,
    SupabaseModule,
    UploadModule,
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
