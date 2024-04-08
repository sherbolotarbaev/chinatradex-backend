import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import type { Request, Response } from 'express';

import { UsersService } from '../../users/services';
import { JwtService } from '../../jwt/services';
import { PrismaService } from '../../prisma/services';

import {
  LoginDto,
  RegisterDto,
  EditMeDto,
  EmailVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SendOtpDto,
  LoginOtpDto,
} from '../dto';

import { GoogleUser } from '../../auth/common/interface';

import { getLocation, compare, hash } from '../../../utils';
import moment from 'moment';

const logger = new Logger('AuthService');

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async googleOAuth(
    {
      // firstName,
      // lastName,
      // photo,
      email,
    }: GoogleUser,
    response: Response,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      // if (!existingUser.isVerified) {
      //   this.sendVerificationCode(
      //     existingUser.id,
      //     existingUser.email,
      //     existingUser.firstName,
      //   );
      // }

      if (!existingUser.isActive) {
        return response
          .status(HttpStatus.FORBIDDEN)
          .redirect(`${process.env.FRONTEND_BASE_URL}/login?error=403`);
      }

      try {
        return existingUser;
      } catch (e: any) {
        logger.error(e);
        throw new Error(e.message);
      }
    }

    return response
      .status(HttpStatus.UNAUTHORIZED)
      .redirect(`${process.env.FRONTEND_BASE_URL}/login?error=401`);

    // const user = await this.usersService.createUser({
    //   firstName,
    //   lastName,
    //   photo,
    //   email,
    //   password: 'google-oauth',
    // });

    // this.sendVerificationCode(user.id, user.email, user.firstName);

    // try {
    //   return user;
    // } catch (e: any) {
    //   logger.error(e);
    //   throw new Error(e.message);
    // }
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.createUser(dto);

    this.sendVerificationCode(user.id, user.email, user.firstName);

    try {
      return user;
    } catch (e) {
      logger.error(e);
      throw new Error(e.message);
    }
  }

  async login({ emailOrUsername, password }: LoginDto) {
    const user = await this.usersService.findByEmailOrUsername(emailOrUsername);
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Неверный пароль');
    }

    // if (!user.isVerified) {
    //   this.sendVerificationCode(user.id, user.email, user.firstName);
    // }

    try {
      return user;
    } catch (e) {
      logger.error(e);
      throw new Error(e.message);
    }
  }

  async logout(request: Request, response: Response) {
    return request.logOut((e: any) => {
      if (e) {
        throw new InternalServerErrorException('Не удалось выйти из системы');
      }

      return response
        .status(HttpStatus.OK)
        .clearCookie('session')
        .send({
          redirectUrl: `/redirect?to=${request.query.next || '/'}`,
        });
    });
  }

  async getMe(ip: string, user: User) {
    const location = await getLocation(ip);

    this.setMetaData(user.id, ip, location);

    delete user.password;
    delete user.resetPasswordToken;
    delete user.verificationToken;

    try {
      return user;
    } catch (e: any) {
      logger.error(e);
      throw new Error(e.message);
    }
  }

  async editMe(
    user: User,
    { firstName, lastName, username, phone }: EditMeDto,
  ) {
    if (username && username !== user.username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: {
          username: username.toLowerCase(),
        },
      });

      if (existingUsername) {
        throw new ConflictException('Имя пользователя занято');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        firstName,
        lastName,
        username: username ? username.toLowerCase() : user.username,
        phone,
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

    delete updatedUser.password;
    delete updatedUser.resetPasswordToken;
    delete updatedUser.verificationToken;

    try {
      return updatedUser;
    } catch (e: any) {
      logger.error(e);
      throw new Error(e.message);
    }
  }

  async emailVerification(user: User, { code }: EmailVerificationDto) {
    if (user.isVerified) {
      throw new BadRequestException('Пользователь уже верифицирован');
    }

    try {
      const comparedCode = await compare(code, user.verificationToken);

      if (!comparedCode) {
        throw new ConflictException(`Код не совпадает`);
      }

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isVerified: true,
        },
      });

      return { success: true };
    } catch (e: any) {
      logger.error(e);
      throw new Error(e.message);
    }
  }

  async forgotPassword({ email }: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(email);

    const identificationToken = await this.jwt.generateResetPasswordToken(
      user.id,
    );
    const forgotLink = `${process.env.FRONTEND_BASE_URL}/password/reset?identification_token=${identificationToken}`;

    await Promise.all([
      this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          resetPasswordToken: identificationToken,
        },
      }),
      this.mailerService.sendMail({
        to: user.email,
        from: process.env.MAILER_USER,
        subject: 'Сброс пароля',
        html: `
            <h2>Привет ${user.firstName}!</h2>
            <p>Чтобы восстановить пароль, воспользуйтесь следующей <a target="_self" href="${forgotLink}">ссылкой</a>.</p>
        `,
      }),
    ]);

    try {
      return {
        message: `Ссылка для сброса пароля была отправлена ${user.email}`,
      };
    } catch (e: any) {
      logger.error(e);
      throw new Error(e.message);
    }
  }

  async resetPassword({ password, identificationToken }: ResetPasswordDto) {
    const compare = await this.jwt.compareResetPasswordToken(
      identificationToken,
    );
    const userId = compare.id;
    const hashedPassword = await hash(password);

    if (!userId) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    try {
      return {
        message: 'Ваш пароль был успешно обновлен',
      };
    } catch (e: any) {
      logger.error(e);
      throw new Error(e.message);
    }
  }

  async sendOtp({ email }: SendOtpDto) {
    const user = await this.usersService.findByEmail(email);

    const otp = await this.generateVerificationCode();
    const otpHash = await hash(otp);

    await Promise.all([
      this.prisma.emailOtp.upsert({
        where: {
          email: user.email,
        },
        update: {
          otp: otpHash,
          expiresAt: moment().add(5, 'minutes').toDate(),
        },
        create: {
          email: user.email,
          otp: otpHash,
          expiresAt: moment().add(5, 'minutes').toDate(),
        },
      }),
      this.mailerService.sendMail({
        to: user.email,
        from: process.env.MAILER_USER,
        subject: 'Временный пароль',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f8f8; padding: 20px;">
            <h2 style="color: #333;">Привет ${user.firstName},</h2>
            <p style="font-size: 16px;">Ваш временный пароль:</p>
            <div style="background-color: #fff; border: 1px solid #ccc; padding: 15px; border-radius: 5px; margin-top: 10px;">
              <h3 style="margin: 0; font-size: 24px; color: #007bff;">${otp}</h3>
            </div>
            <p style="font-size: 14px; margin-top: 15px;">Пожалуйста, используйте этот временный пароль для авторизации.</p>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">Это письмо было отправлено автоматически. Пожалуйста, не отвечайте.</p>
        </div>
        `,
      }),
    ]);

    try {
      return {
        email: user.email,
      };
    } catch (e: any) {
      logger.error(e);
      throw new Error(e.message);
    }
  }

  async loginOtp({ email, otp }: LoginOtpDto) {
    const user = await this.usersService.findByEmail(email);

    const emailOtp = await this.prisma.emailOtp.findUnique({
      where: {
        email: user.email,
      },
    });

    const otpMatch = await compare(otp, emailOtp.otp);
    if (!otpMatch) {
      throw new BadRequestException('Неверный временный пароль');
    }

    if (moment.utc(emailOtp.expiresAt).isBefore(moment().utc())) {
      throw new BadRequestException('Истек срок действия временного пароля');
    }

    try {
      return user;
    } catch (e: any) {
      logger.error(e);
      throw new Error(e.message);
    }
  }

  private async generateVerificationCode() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
  }

  private async sendVerificationCode(
    userId: number,
    userEmail: string,
    userName: string,
  ) {
    const code = await this.generateVerificationCode();
    const verificationToken = await hash(code);

    await Promise.all([
      this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          verificationToken,
        },
      }),
      this.mailerService.sendMail({
        to: userEmail,
        from: process.env.MAILER_USER,
        subject: 'Код верификации',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f8f8; padding: 20px;">
            <h2 style="color: #333;">Привет ${userName},</h2>
            <p style="font-size: 16px;">Ваш код верификации:</p>
            <div style="background-color: #fff; border: 1px solid #ccc; padding: 15px; border-radius: 5px; margin-top: 10px;">
              <h3 style="margin: 0; font-size: 24px; color: #007bff;">${code}</h3>
            </div>
            <p style="font-size: 14px; margin-top: 15px;">Пожалуйста, используйте этот код для проверки электронной почты.</p>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">Это письмо было отправлено автоматически. Пожалуйста, не отвечайте.</p>
        </div>
        `,
      }),
    ]);
  }

  private async setMetaData(
    userId: number,
    ip: string,
    { city, country, region, timezone }: LocationData,
  ) {
    await this.prisma.userMetaData.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        ip,
        city,
        country,
        region,
        timezone,
        lastVisit: new Date(),
      },
      update: {
        ip,
        city,
        country,
        region,
        timezone,
        lastVisit: new Date(),
      },
    });
  }
}
