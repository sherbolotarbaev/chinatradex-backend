import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

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
