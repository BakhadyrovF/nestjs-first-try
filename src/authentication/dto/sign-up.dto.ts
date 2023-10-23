import { IsEmail, IsNotEmpty, Matches, MaxLength, MinLength } from "class-validator";


export class SignUpDTO {
    @IsNotEmpty()
    @MaxLength(255)
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MaxLength(50)
    @IsNotEmpty()
    @Matches('^[a-zA-Z0-9_.]+$')
    username: string;

    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(128)
    password: string
}