import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { UsersModule } from 'src/users/users.module';
import { AuthenticationService } from './authentication.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        UsersModule,
        JwtModule.register({
            global: true,
            'secret': process.env.JWT_SECRET,
            signOptions: {
                issuer: process.env.APP_URL,
            }
        })
    ],
    controllers: [AuthenticationController],
    providers: [AuthenticationService]
})
export class AuthenticationModule { }
