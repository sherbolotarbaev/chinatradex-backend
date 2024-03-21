import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';

import {
  SessionInterceptor,
  SessionAuthGuard,
  JWTAuthGuard,
  LocalAuthGuard,
  GoogleOauthGuard,
  User,
  Ip,
  Public,
} from './common';

import {
  RegisterDto,
  EditMeDto,
  EmailVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';

@Controller()
@UseGuards(SessionAuthGuard, JWTAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('google/callback')
  @HttpCode(HttpStatus.OK)
  @UseGuards(GoogleOauthGuard)
  @UseInterceptors(SessionInterceptor)
  async googleOAuthCallback(@User() user: User) {
    return user;
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(SessionInterceptor)
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(SessionInterceptor)
  async login(@User() user: User) {
    return user;
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: Request, @Res() response: Response) {
    return await this.authService.logout(request, response);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@Ip() ip: string, @User() user: User) {
    return await this.authService.getMe(ip, user);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async editMe(@User() user: User, @Body() dto: EditMeDto) {
    return await this.authService.editMe(user, dto);
  }

  @Post('email-verification')
  @HttpCode(HttpStatus.OK)
  async emailVerification(
    @User() user: User,
    @Body() dto: EmailVerificationDto,
  ) {
    return await this.authService.emailVerification(user, dto);
  }

  @Public()
  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto);
  }
}
