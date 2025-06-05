"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
const nest_winston_1 = require("nest-winston");
const winston_1 = require("winston");
let EmailService = class EmailService {
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
        this.logger.info('Initializing EmailService', { context: 'EmailService' });
        this.transporter = nodemailer.createTransport({
            service: this.configService.get('EMAIL_SERVICE'),
            auth: {
                user: this.configService.get('EMAIL_AUTH_USER'),
                pass: this.configService.get('EMAIL_AUTH_PASSWORD'),
            }
        });
        this.logger.info('Email transporter created', {
            context: 'EmailService',
            service: this.configService.get('EMAIL_SERVICE'),
            user: this.configService.get('EMAIL_AUTH_USER')
        });
    }
    async sendMemberJoinVerification(emailAddress, signupVerifyToken) {
        this.logger.info('Preparing verification email', {
            context: 'EmailService',
            to: emailAddress
        });
        const baseUrl = this.configService.get('EMAIL_BASE_URL');
        const url = `${baseUrl}/users/email-verify?signupVerifyToken=${signupVerifyToken}`;
        const mailOptions = {
            to: emailAddress,
            subject: '가입 인증 메일',
            html: `
        가입확인 버튼를 누르시면 가입 인증이 완료됩니다.<br/>
        <form action="${url}" method="POST">
          <button>가입확인</button>
        </form>
      `
        };
        try {
            this.logger.debug('Sending verification email', {
                context: 'EmailService',
                to: emailAddress,
                verifyUrl: url
            });
            await this.transporter.sendMail(mailOptions);
            this.logger.info('Verification email sent successfully', {
                context: 'EmailService',
                to: emailAddress
            });
        }
        catch (error) {
            this.logger.error('Failed to send verification email', {
                context: 'EmailService',
                error: error.message,
                to: emailAddress
            });
            throw error;
        }
    }
};
EmailService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_PROVIDER)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        winston_1.Logger])
], EmailService);
exports.EmailService = EmailService;
//# sourceMappingURL=email.service.js.map