import { IsEmail, IsNotEmpty } from "class-validator";

export class SendOtpDto {
  @IsNotEmpty({ message: 'Электронная почта не может быть пустой' })
  @IsEmail({}, { message: 'Неверный формат электронной почты' })
  email: string;
}
