import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{
        access_token: string;
        message: string;
    }>;
}
