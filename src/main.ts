import { NestFactory } from '@nestjs/core';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { config } from 'dotenv';
import { AppModule } from './app.module';
import { ValidationError } from 'class-validator';
import * as cookieParser from 'cookie-parser';

config();
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: ['http://localhost:3001', 'http://localhost:3000'],
        credentials: true,
    });
    app.use(cookieParser(process.env.APP_SECRET));
    app.useGlobalPipes(new ValidationPipe({
        stopAtFirstError: true,
        disableErrorMessages: process.env.APP_ENVIRONMENT === 'production',
        errorHttpStatusCode: 422,
        exceptionFactory: (errors: ValidationError[]) => {
            return new UnprocessableEntityException({
                message: 'Validation failed.',
                error: Object.values(errors[0].constraints)[0]
            });
        }
    }));
    app.setGlobalPrefix('api/v1');
    await app.listen(3000);
}
bootstrap();
