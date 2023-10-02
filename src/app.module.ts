import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from './authentication/authentication.module';
import { UsersModule } from './users/users.module';
import { SharedModule } from './shared.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        SharedModule,
        AuthenticationModule,
        UsersModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
