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
  @IsNotEmpty({ message: 'First Name cannot be empty' })
  @IsString({ message: 'First Name must be a string' })
  @MinLength(2, { message: 'First Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First Name cannot be longer than 50 characters' })
  firstName: string;

  @IsNotEmpty({ message: 'Last Name cannot be empty' })
  @IsString({ message: 'Last Name must be a string' })
  @MinLength(2, { message: 'Last Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last Name cannot be longer than 50 characters' })
  lastName: string;

  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Password cannot be empty' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(16, { message: 'Password cannot be longer than 16 characters' })
  password: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Photo cannot be empty' })
  @IsString({ message: 'Photo must be a string' })
  photo?: string;
}
