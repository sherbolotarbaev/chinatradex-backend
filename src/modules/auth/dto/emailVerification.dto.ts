import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class EmailVerificationDto {
  @IsNotEmpty({ message: 'Код не может быть пустым' })
  @IsString({ message: 'Код должен быть строкой' })
  @MinLength(6, { message: 'Код должен состоять ровно из шести цифр' })
  @MaxLength(6, { message: 'Код должен состоять ровно из шести цифр' })
  code: string;
}
