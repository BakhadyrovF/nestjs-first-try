import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database.service';
import { SessionTokens } from './interfaces/session-tokens.interface';
import { Response } from 'express';
import { TokenPayload } from './interfaces/token-payload.interface';
import { UserSessionWithTokens } from './types/user-session-with-tokens.type';

// in seconds
export const REFRESH_TOKEN_LIFETIME = 7 * 24 * 60 * 60;
export const ACCESS_TOKEN_LIFETIME = 3600;

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly database: DatabaseService,
        private readonly jwtProvider: JwtService
    ) { }

    async createNewSession(
        userId: string,
        userAgent: string,
        ipAddress: string = null
    ): Promise<SessionTokens> {
        const session = await this.database.userSession.create({
            data: {
                userAgent: userAgent,
                ipAddress: ipAddress,
                userId: userId
            },
            select: {
                id: true,
                token: true
            }
        });


        const { accessToken, refreshToken } = this.createNewPairOfTokens({
            sub: userId,
            sessionId: session.id.toString(),
        });

        await this.database.sessionToken.create({
            data: {
                refreshToken: refreshToken,
                sessionId: session.id
            }
        });

        return { accessToken, refreshToken };
    }

    createNewPairOfTokens(payload: TokenPayload): SessionTokens {
        return {
            accessToken: this.createAccessToken(payload),
            refreshToken: this.createRefreshToken(payload)
        };
    }

    setRefreshTokenToCookie(response: Response, token: string) {
        response.cookie('refreshToken', token, {
            maxAge: REFRESH_TOKEN_LIFETIME * 1000,
            domain: 'localhost', // TODO: use environment variable
            httpOnly: true,
            sameSite: 'strict',
        });
    }

    verifyRefreshToken(refreshToken: string): TokenPayload | false {
        let payload: TokenPayload;
        try {
            payload = this.jwtProvider.verify(refreshToken);
        } catch {
            return false
        }
        return payload;
    }

    async invalidateRefreshToken(sessionId: bigint) {
        const session: UserSessionWithTokens = await this.database.userSession.findUnique({
            where: {
                id: sessionId
            },
            include: {
                token: true
            }
        });


    }

    private createAccessToken(payload: TokenPayload): string {
        return this.jwtProvider.sign({
            sub: payload.sub,
            sessionId: payload.sessionId
        }, {
            expiresIn: ACCESS_TOKEN_LIFETIME
        })
    }

    private createRefreshToken(payload: TokenPayload): string {
        return this.jwtProvider.sign({
            sub: payload.sub,
            sessionId: payload.sessionId
        }, {
            expiresIn: REFRESH_TOKEN_LIFETIME
        })
    }
}
