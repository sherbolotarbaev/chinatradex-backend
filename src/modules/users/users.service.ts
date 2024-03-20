import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateUserDto } from './dto';

import { hash, verifyEmail } from '../../utils';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(user: User, query: string) {
    if (user.role === 'USER') {
      throw new ForbiddenException(
        'You do not have the necessary permission to access users information',
      );
    }

    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          {
            role: 'USER',
            AND: query
              ? [
                  {
                    OR: [
                      { firstName: { contains: query, mode: 'insensitive' } },
                      { lastName: { contains: query, mode: 'insensitive' } },
                      { email: { contains: query, mode: 'insensitive' } },
                    ],
                  },
                ]
              : [],
          },
          {
            role: 'ADMIN',
            AND: query
              ? [
                  {
                    OR: [
                      { firstName: { contains: query, mode: 'insensitive' } },
                      { lastName: { contains: query, mode: 'insensitive' } },
                      { email: { contains: query, mode: 'insensitive' } },
                    ],
                  },
                ]
              : [],
          },
        ],
      },
    });

    try {
      return {
        count: users.length,
        users,
      };
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async getUser(user: User, username: string) {
    if (user.role === 'USER') {
      throw new ForbiddenException(
        'You do not have the necessary permission to access user information',
      );
    }

    // Ensure that username is a string
    if (!isNaN(parseInt(username))) {
      throw new ConflictException('Parameter username must be a string');
    }

    try {
      return this.findByUsername(username);
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async deleteUser(user: User, username: string) {
    if (user.role === 'USER') {
      throw new ForbiddenException(
        'You do not have the necessary permission to delete a user',
      );
    }

    // Ensure that username is a string
    if (!isNaN(parseInt(username))) {
      throw new ConflictException('Parameter username must be a string');
    }

    const dbUser = await this.findByUsername(username);

    if (dbUser.id === user.id) {
      throw new ForbiddenException(
        `You can't delete yourself, please inform someone with a Admin role`,
      );
    }

    try {
      await this.prisma.user.delete({
        where: {
          id: dbUser.id,
        },
      });

      return { success: true };
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async createUser({
    firstName,
    lastName,
    email,
    password,
    photo,
  }: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const isEmailValid = await verifyEmail(email.toLowerCase());

    if (!isEmailValid) {
      throw new BadRequestException('Your email is not valid');
    }

    try {
      const hashedPassword = await hash(password);
      const username = await this.generateUniqueUsername(email);

      const user = await this.prisma.user.create({
        data: {
          firstName,
          lastName,
          email: email.toLowerCase(),
          username,
          password: hashedPassword,
          photo,
        },
      });

      return user;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async findById(id: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
      },
      include: {
        metaData: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("User doesn't exist");
    }

    if (!user.isActive) {
      throw new ForbiddenException('User has been deactivated');
    }

    try {
      return user;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async findByEmailOrUsername(emailOrUsername: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername.toLowerCase() },
        ],
      },
      include: {
        metaData: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("User doesn't exist");
    }

    if (!user.isActive) {
      throw new ForbiddenException('User has been deactivated');
    }

    try {
      return user;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
      include: {
        metaData: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("User doesn't exist");
    }

    if (!user.isActive) {
      throw new ForbiddenException('User has been deactivated');
    }

    try {
      return user;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: username.toLowerCase(),
      },
      include: {
        metaData: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("User doesn't exist");
    }

    if (!user.isActive) {
      throw new ForbiddenException('User has been deactivated');
    }

    try {
      return user;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  private async generateUniqueUsername(email: string) {
    let username = email.toLowerCase().split('@')[0].trim();

    const existingUsername = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUsername) {
      username = `${username}-${Date.now()}`;
    }

    return username;
  }
}
