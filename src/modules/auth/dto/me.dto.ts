import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

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
