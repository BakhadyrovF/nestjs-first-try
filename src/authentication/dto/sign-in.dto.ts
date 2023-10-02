import { IsEmail, MaxLength, MinLength } from "class-validator";


export class SignInDTO {
    @MaxLength(255)
    @IsEmail()
    email: string;

    @MinLength(8)
    @MaxLength(128)
    password: string
}