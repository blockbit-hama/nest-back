import { DataSource, Repository } from 'typeorm';
import { UserInfo } from './UserInfo';
import { UserEntity } from './entity/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { EmailService } from 'src/email/email.service';
import { Logger } from 'winston';
export declare class UsersService {
    private emailService;
    private usersRepository;
    private dataSource;
    private authService;
    private readonly logger;
    constructor(emailService: EmailService, usersRepository: Repository<UserEntity>, dataSource: DataSource, authService: AuthService, logger: Logger);
    createUser(name: string, email: string, password: string): Promise<void>;
    private checkUserExists;
    private saveUserUsingTransaction;
    private sendMemberJoinEmail;
    verifyEmail(signupVerifyToken: string): Promise<string>;
    login(email: string, password: string): Promise<string>;
    getUserInfo(userId: string): Promise<UserInfo>;
}
