import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database.service';
import { SessionTokens } from './interfaces/session-tokens.interface';


export const REFRESH_TOKEN_LIFETIME = 604800;
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
        const { accessToken, refreshToken } = this.createNewPairOfTokens(userId);

        await this.database.userSession.create({
            data: {
                userAgent: userAgent,
                ipAddress: ipAddress,
                token: {
                    create: {
                        refreshToken: refreshToken
                    }
                },
                user: {
                    connect: {
                        id: userId
                    }
                }
            },
            select: {
                token: {
                    select: {
                        refreshToken: true
                    }
                }
            }
        });

        return { accessToken, refreshToken };
    }

    createNewPairOfTokens(userId: string): SessionTokens {
        return {
            accessToken: this.createAccessToken(userId),
            refreshToken: this.createRefreshToken(userId)
        };
    }

    private createAccessToken(userId: string): string {
        return this.jwtProvider.sign({
            sub: userId
        }, {
            expiresIn: ACCESS_TOKEN_LIFETIME
        })
    }

    private createRefreshToken(userId: string): string {
        return this.jwtProvider.sign({
            sub: userId
        }, {
            expiresIn: REFRESH_TOKEN_LIFETIME
        })
    }
}
