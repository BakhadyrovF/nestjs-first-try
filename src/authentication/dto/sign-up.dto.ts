import { IsEmail, IsNotEmpty, Matches, MaxLength, MinLength } from "class-validator";


export class SignUpDTO {
    @MaxLength(255)
    @IsEmail()
    email: string;

    @MaxLength(50)
    @IsNotEmpty()
    @Matches('^[a-zA-Z0-9_.]+$')
    username: string;

    @MinLength(8)
    @MaxLength(128)
    password: string
}