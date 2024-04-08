import {
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

import { UsersService } from '../services';

import { SessionAuthGuard, JWTAuthGuard, User } from '../../auth/common';

@Controller('users')
@UseGuards(SessionAuthGuard, JWTAuthGuard)
@UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsers(@User() user: User, @Query('q') query: string) {
    return await this.usersService.getUsers(user, query);
  }

  @Get(':username')
  @HttpCode(HttpStatus.OK)
  async getUser(@User() user: User, @Param('username') username: string) {
    return await this.usersService.getUser(user, username);
  }

  @Delete(':username')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@User() user: User, @Param('username') username: string) {
    return await this.usersService.deleteUser(user, username);
  }
}
