import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { compare, hash } from '../../utils/bcrypt';
import { JwtService } from '../jwt/jwt.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';

import {
  LoginDto,
  RegisterDto,
  EditMeDto,
  EmailVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';

import { GoogleUser } from '../auth/common/interface';

import { getLocation } from '../../utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async googleOAuthValidate({
    firstName,
    lastName,
    photo,
    email,
  }: GoogleUser): Promise<User | { error: boolean; status: number }> {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      if (!existingUser.isVerified || !existingUser.verificationToken) {
        this.sendVerificationCode(
          existingUser.id,
          existingUser.email,
          existingUser.firstName,
        );
      }

      if (!existingUser.isActive) {
        return { error: true, status: 403 };
      }

      try {
        return existingUser;
      } catch (e: any) {
        console.error(e);
        throw new Error(e.message);
      }
    }

    const user = await this.usersService.createUser({
      firstName,
      lastName,
      email,
      password: 'google-oauth',
      photo,
    });

    this.sendVerificationCode(user.id, user.email, user.firstName);

    try {
      return user;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.createUser(dto);

    this.sendVerificationCode(user.id, user.email, user.firstName);

    try {
      return user;
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async login({ emailOrUsername, password }: LoginDto) {
    const user = await this.usersService.findByEmailOrUsername(emailOrUsername);
    const comparedPassword = await compare(password, user.password);

    if (!comparedPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    if (!user.isVerified || !user.verificationToken) {
      this.sendVerificationCode(user.id, user.email, user.firstName);
    }

    try {
      return user;
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
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
      console.error(e);
      throw new Error(e.message);
    }
  }

  async editMe(user: User, { firstName, lastName, username }: EditMeDto) {
    if (username && username !== user.username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: {
          username: username.toLowerCase(),
        },
      });

      if (existingUsername) {
        throw new ConflictException('Username already taken');
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
      },
    });

    try {
      return updatedUser;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async emailVerification(user: User, { code }: EmailVerificationDto) {
    if (user.isVerified) {
      throw new BadRequestException('User has already been verified');
    }

    try {
      const comparedCode = await compare(code, user.verificationToken);

      if (!comparedCode) {
        throw new ConflictException(`Code doesn't match`);
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
      console.error(e);
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
        subject: 'Password reset',
        html: `
            <h2>Hey ${user.firstName}</h2>
            <p>To recover your password, please use this <a target="_self" href="${forgotLink}">link</a>.</p>
        `,
      }),
    ]);

    try {
      return {
        message: `Password reset link has been sent to ${user.email}`,
      };
    } catch (e: any) {
      console.error(e);
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
      throw new UnauthorizedException('User not found');
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
        message: 'Your password has been successfully updated',
      };
    } catch (e: any) {
      console.error(e);
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
        subject: 'Verification Code',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f8f8; padding: 20px;">
            <h2 style="color: #333;">Hey ${userName},</h2>
            <p style="font-size: 16px;">Your verification code is:</p>
            <div style="background-color: #fff; border: 1px solid #ccc; padding: 15px; border-radius: 5px; margin-top: 10px;">
              <h3 style="margin: 0; font-size: 24px; color: #007bff;">${code}</h3>
            </div>
            <p style="font-size: 14px; margin-top: 15px;">Please use this code to verify your email address.</p>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">This email was sent automatically. Please do not reply.</p>
        </div>
        `,
      }),
    ]);
  }

  private async setMetaData(
    userId: number,
    ip: string,
    location: LocationData,
  ) {
    await this.prisma.userMetaData.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        ip,
        ...location,
        lastVisit: new Date(),
      },
      update: {
        ip,
        ...location,
        lastVisit: new Date(),
      },
    });
  }
}
