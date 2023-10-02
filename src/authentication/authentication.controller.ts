import { BadRequestException, Body, Controller, HttpCode, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { SignUpDTO } from './dto/sign-up.dto';
import { UsersService } from 'src/users/users.service';
import { ACCESS_TOKEN_LIFETIME, AuthenticationService, REFRESH_TOKEN_LIFETIME } from './authentication.service';
import { Request, Response } from 'express';
import { SignInDTO } from './dto/sign-in.dto';
import { compare } from 'bcrypt';

@Controller()
export class AuthenticationController {

    constructor(
        private service: AuthenticationService,
        private usersService: UsersService
    ) { }

    @Post('/sign-up')
    async signUp(
        @Req() request: Request,
        @Body() dto: SignUpDTO,
        @Res({ passthrough: true }) response: Response
    ) {
        if (await this.usersService.isEmailAlreadyTaken(dto.email)) {
            throw new BadRequestException({
                error: 'User with provided email already exists.'
            });
        }

        if (await this.usersService.isUsernameAlreadyTaken(dto.username)) {
            throw new BadRequestException({
                error: 'User with provided username already exists.'
            });
        }

        const user = await this.usersService.createUser(dto);

        const { accessToken, refreshToken } = await this.service.createNewSession(
            user.id, request.headers['user-agent'], request.ip
        );

        response.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: REFRESH_TOKEN_LIFETIME
        });

        return {
            accessToken,
            expiresIn: ACCESS_TOKEN_LIFETIME
        }
    }

    @Post('/sign-in')
    async signIn(
        @Req() request: Request,
        @Body() dto: SignInDTO,
        @Res({ passthrough: true }) response: Response
    ) {
        const user = await this.usersService.findUserByEmail(dto.email);
        if (!user) {
            throw new BadRequestException('User with provided email not found.');
        }

        if (!await compare(dto.password, user.password)) {
            throw new BadRequestException('Invalid password provided.');
        }

        const { accessToken, refreshToken } = await this.service.createNewSession(
            user.id,
            request.headers['user-agent'],
            request.ip
        );

        response.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: REFRESH_TOKEN_LIFETIME,
        });

        return {
            accessToken,
            expiresIn: ACCESS_TOKEN_LIFETIME
        };
    }
}
