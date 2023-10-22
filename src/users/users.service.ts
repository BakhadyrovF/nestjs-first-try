import { Injectable } from "@nestjs/common";
import { Prisma, User, UserSession } from "@prisma/client";
import { hash } from "bcrypt";
import { SignUpDTO } from "src/authentication/dto/sign-up.dto";
import { DatabaseService } from "src/database.service";
import { v4 as uuid } from "uuid";

@Injectable()
export class UsersService {
    constructor(private readonly database: DatabaseService) { }

    async isEmailAlreadyTaken(email: string): Promise<boolean> {
        const user = await this.findUserByGivenFilters({ email: email })
        return Boolean(user);
    }

    async isUsernameAlreadyTaken(username: string): Promise<boolean> {
        const user = await this.findUserByGivenFilters({ username: username });
        return Boolean(user);
    }

    async findUserByEmail(email: string): Promise<User> {
        return this.findUserByGivenFilters({ email: email });
    }

    async findUserById(id: string): Promise<User> {
        return this.findUserByGivenFilters({ id: id });
    }

    async findUserSessionById(sessionId: bigint): Promise<UserSession> {
        return this.database.userSession.findUnique({
            where: {
                id: sessionId
            }
        })
    }

    private async findUserByGivenFilters(filters: Prisma.UserWhereInput): Promise<User> {
        const user = await this.database.user.findFirst({
            where: filters
        });

        return user;
    }

    async createUser(dto: SignUpDTO): Promise<Pick<User, 'id'>> {
        const hashedPassword = await hash(dto.password, 10);
        const user = await this.database.user.create({
            data: {
                id: uuid(),
                email: dto.email,
                username: dto.username,
                password: hashedPassword
            },
            select: {
                id: true
            }
        });

        return user;
    }
}