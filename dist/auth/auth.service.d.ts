import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    private readonly usersRepository;
    private transporter;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService, usersRepository: Repository<User>);
    private sendVerificationEmail;
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
    verifyEmail(signupVerifyToken: string): Promise<{
        access_token: string;
        message: string;
    }>;
    verify(token: string): any;
}
