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

        this.service.setRefreshTokenToCookie(response, refreshToken);

        return {
            accessToken,
            expiresIn: ACCESS_TOKEN_LIFETIME
        }
    }

    @Post('/sign-in')
    @HttpCode(200)
    async signIn(
        @Req() request: Request,
        @Body() dto: SignInDTO,
        @Res() response: Response
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

        this.service.setRefreshTokenToCookie(response, refreshToken);

        return response.send({
            accessToken,
            expiresIn: ACCESS_TOKEN_LIFETIME
        });
    }

    @Post('/access-tokens/refresh')
    @HttpCode(200)
    async refreshToken(@Req() request: Request) {
        const refreshToken = request.cookies.refreshToken;

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token is required.');
        }

        const payload = this.service.verifyRefreshToken(refreshToken);
        if (!payload) {
            throw new UnauthorizedException('Invalid refresh token provided.');
        }

        // const currentSession = await this.service.getSessionById(payload.sessionId);

    }
}
