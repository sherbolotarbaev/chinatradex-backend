import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsNotEmpty({
    message: 'Электронная почта или имя пользователя не могут быть пустыми',
  })
  @IsString({
    message: 'Неверный формат электронной почты или имени пользователя',
  })
  emailOrUsername: string;

  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(8, {
    message: 'Пароль должен состоять не менее чем из 8 символов',
  })
  @MaxLength(16, { message: 'Пароль не может быть длиннее 16 символов' })
  password: string;
}

export class RegisterDto {
  @IsNotEmpty({ message: 'Имя не может быть пустым' })
  @IsString({ message: 'Имя должно быть строкой' })
  @MinLength(2, { message: 'Имя должно содержать не менее 2 символов' })
  @MaxLength(64, { message: 'Имя не может быть длиннее 64 символов' })
  firstName: string;

  @IsNotEmpty({ message: 'Фамилия не может быть пустой' })
  @IsString({ message: 'Фамилия должна быть строкой' })
  @MinLength(2, { message: 'Фамилия должна содержать не менее 2 символов' })
  @MaxLength(64, { message: 'Фамилия не может быть длиннее 64 символов' })
  lastName: string;

  @IsNotEmpty({ message: 'Электронная почта не может быть пустой' })
  @IsEmail({}, { message: 'Неверный формат электронной почты' })
  email: string;

  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(8, {
    message: 'Пароль должен состоять не менее чем из 8 символов',
  })
  @MaxLength(16, { message: 'Пароль не может быть длиннее 16 символов' })
  password: string;
}

export class EditMeDto {
  @IsNotEmpty({ message: 'Имя не может быть пустым' })
  @IsString({ message: 'Имя должно быть строкой' })
  @MinLength(2, { message: 'Имя должно содержать не менее 2 символов' })
  @MaxLength(64, { message: 'Имя не может быть длиннее 64 символов' })
  firstName: string;

  @IsNotEmpty({ message: 'Фамилия не может быть пустой' })
  @IsString({ message: 'Фамилия должна быть строкой' })
  @MinLength(2, { message: 'Фамилия должна содержать не менее 2 символов' })
  @MaxLength(64, { message: 'Фамилия не может быть длиннее 64 символов' })
  lastName: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Имя пользователя не может быть пустым' })
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  @MinLength(3, {
    message: 'Имя пользователя должно содержать не менее 3 символов',
  })
  @MaxLength(80, {
    message: 'Имя пользователя не может быть длиннее 80 символов',
  })
  username?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Номер телефона не может быть пустым' })
  @IsString({ message: 'Номер телефона должно быть строкой' })
  @Matches(
    /^\+?\d{1,3}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
    {
      message: 'Неверный номер телефона',
    },
  )
  phone?: string;
}

export class EmailVerificationDto {
  @IsNotEmpty({ message: 'Код не может быть пустым' })
  @IsString({ message: 'Код должен быть строкой' })
  @MinLength(6, { message: 'Код должен состоять ровно из шести цифр' })
  @MaxLength(6, { message: 'Код должен состоять ровно из шести цифр' })
  code: string;
}

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
