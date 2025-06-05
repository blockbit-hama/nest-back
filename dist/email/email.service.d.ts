import { ConfigService } from '@nestjs/config';
import { Logger } from 'winston';
export declare class EmailService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService, logger: Logger);
    sendMemberJoinVerification(emailAddress: string, signupVerifyToken: string): Promise<void>;
}
