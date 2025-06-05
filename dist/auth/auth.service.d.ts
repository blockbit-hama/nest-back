import authConfig from 'src/config/authConfig';
import { ConfigType } from '@nestjs/config';
interface User {
    id: string;
    name: string;
    email: string;
}
export declare class AuthService {
    private config;
    constructor(config: ConfigType<typeof authConfig>);
    login(user: User): string;
    verify(jwtString: string): {
        userId: string;
        email: string;
    };
}
export {};
