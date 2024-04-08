import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginOtpDto {
  @IsNotEmpty({ message: 'Электронная почта не может быть пустой' })
  @IsEmail({}, { message: 'Неверный формат электронной почты' })
  email: string;

  @IsNotEmpty({ message: 'Временный пароль не может быть пустым' })
  @IsString({ message: 'Временный пароль должен быть строкой' })
  @MinLength(6, {
    message: 'Временный пароль должен состоять ровно из шести цифр',
  })
  @MaxLength(6, {
    message: 'Временный пароль должен состоять ровно из шести цифр',
  })
  otp: string;
}
