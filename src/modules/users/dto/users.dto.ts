import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
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

  @IsOptional()
  @IsNotEmpty({ message: 'Фото не может быть пустым' })
  @IsString({ message: 'Фотография должна быть строкой' })
  photo?: string;
}
