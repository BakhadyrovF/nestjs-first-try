import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { TokenPayload } from './interfaces/token-payload.interface';
import { User, UserSession } from '@prisma/client';

@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        let user: User;
        let session: UserSession;

        if (!token) {
            this.throwUnauthorizedException();
        }
        try {
            const payload: TokenPayload = this.jwtService.verify(token);
            user = await this.usersService.findUserById(payload.sub);
            session = await this.usersService.findUserSessionById(BigInt(payload.sessionId));
        } catch {
            this.throwUnauthorizedException();
        }

        if (!session.isActive) {
            this.throwUnauthorizedException();
        }

        this.attachUser(request, user);

        return true;
    }

    private extractTokenFromHeader(request: Request): string {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : null;
    }

    private throwUnauthorizedException(message: string = 'Unauthenticated.'): void {
        throw new UnauthorizedException(message);
    }

    private attachUser(request: Request, user: User): void {
        request['user'] = user;
    }
}