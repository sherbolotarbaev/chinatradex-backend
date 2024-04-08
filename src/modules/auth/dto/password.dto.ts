import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'Электронная почта не может быть пустой' })
  @IsEmail({}, { message: 'Неверный формат электронной почты' })
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Идентификационный ключ не может быть пустым' })
  @IsString({ message: 'Идентификационный ключ должен быть строкой' })
  identificationToken: string;

  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(8, {
    message: 'Пароль должен состоять не менее чем из 8 символов',
  })
  @MaxLength(16, { message: 'Пароль не может быть длиннее 16 символов' })
  password: string;
}
