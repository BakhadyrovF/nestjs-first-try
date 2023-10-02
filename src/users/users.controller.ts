import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';

@Controller('users')
export class UsersController {

    @UseGuards(AuthenticationGuard)
    @Get('/me')
    me(@Req() request: Request) {
        const user: User = request['user'];
        return {
            id: user.id,
            email: user.email,
            username: user.username
        };
    }
}
