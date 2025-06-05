import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'winston';
interface User {
    id: string;
    name: string;
    email: string;
}
export declare class AuthService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService, logger: Logger);
    login(user: User): string;
    verify(jwtString: string): string | jwt.JwtPayload;
}
export {};
