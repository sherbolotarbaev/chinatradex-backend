import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/services';

import { CreateUserDto } from '../dto';

import { hash, verifyEmail } from '../../../utils';

const logger = new Logger('UsersService');

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(user: User, query: string) {
    if (user.role === 'USER') {
      throw new ForbiddenException(
        'У вас нет необходимого разрешения на доступ к информации о пользователях',
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
      logger.error(e);
      throw new Error(e.message);
    }
  }

  async getUser(user: User, username: string) {
    if (user.role === 'USER') {
      throw new ForbiddenException(
        'У вас нет необходимого разрешения на доступ к информации о пользователе',
      );
    }

    // Ensure that username is a string
    if (!isNaN(parseInt(username))) {
      throw new ConflictException('Параметр username должен быть строкой');
    }

    try {
      return this.findByUsername(username);
    } catch (e: any) {
      logger.error(e);
      throw new Error(e.message);
    }
  }

  async deleteUser(user: User, username: string) {
    if (user.role === 'USER') {
      throw new ForbiddenException(
        'У вас нет необходимых прав для удаления пользователя',
      );
    }

    // Ensure that username is a string
    if (!isNaN(parseInt(username))) {
      throw new ConflictException('Параметр username должен быть строкой');
    }

    const dbUser = await this.findByUsername(username);

    if (dbUser.id === user.id) {
      throw new ForbiddenException(
        `Вы не можете удалить себя, пожалуйста, сообщите кому-нибудь с ролью администратора`,
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
      logger.error(e);
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
      throw new ConflictException('Пользователь уже существует');
    }

    const isEmailValid = await verifyEmail(email.toLowerCase());

    if (!isEmailValid) {
      throw new BadRequestException(
        'Ваш адрес электронной почты недействителен',
      );
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
      logger.error(e);
      throw new Error(e.message);
    }
  }

  async findById(id: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
      },
      include: {
        metaData: {
          select: {
            ip: true,
            city: true,
            region: true,
            country: true,
            timezone: true,
            lastVisit: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Пользователь был деактивирован');
    }

    try {
      return user;
    } catch (e: any) {
      logger.error(e);
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
        metaData: {
          select: {
            ip: true,
            city: true,
            region: true,
            country: true,
            timezone: true,
            lastVisit: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Пользователь был деактивирован');
    }

    try {
      return user;
    } catch (e: any) {
      logger.error(e);
      throw new Error(e.message);
    }
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
      include: {
        metaData: {
          select: {
            ip: true,
            city: true,
            region: true,
            country: true,
            timezone: true,
            lastVisit: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Пользователь был деактивирован');
    }

    try {
      return user;
    } catch (e: any) {
      logger.error(e);
      throw new Error(e.message);
    }
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: username.toLowerCase(),
      },
      include: {
        metaData: {
          select: {
            ip: true,
            city: true,
            region: true,
            country: true,
            timezone: true,
            lastVisit: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователя не существует');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Пользователь был деактивирован');
    }

    try {
      return user;
    } catch (e: any) {
      logger.error(e);
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
