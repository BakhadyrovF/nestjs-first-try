import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";


export class SignInDTO {
    @IsNotEmpty()
    @MaxLength(255)
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(128)
    password: string
}