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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const custom_exceptions_1 = require("../exception/custom-exceptions");
const bcrypt = require("bcrypt");
const uuid_1 = require("uuid");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let AuthService = class AuthService {
    constructor(usersService, jwtService, configService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.transporter = nodemailer.createTransport({
            service: this.configService.get('EMAIL_SERVICE'),
            auth: {
                user: this.configService.get('EMAIL_AUTH_USER'),
                pass: this.configService.get('EMAIL_AUTH_PASSWORD'),
            },
        });
    }
    async sendVerificationEmail(email, signupVerifyToken) {
        const baseUrl = this.configService.get('EMAIL_BASE_URL');
        const verificationUrl = `${baseUrl}/auth/verify-email?signupVerifyToken=${signupVerifyToken}`;
        await this.transporter.sendMail({
            to: email,
            subject: '이메일 인증을 완료해주세요.',
            html: `
        <h3>이메일 인증</h3>
        <p>아래 링크를 클릭하여 이메일 인증을 완료해주세요:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
      `,
        });
    }
    async register(registerDto) {
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new custom_exceptions_1.DuplicateEntityException('이메일');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const signupVerifyToken = (0, uuid_1.v4)();
        const user = await this.usersService._createUser(Object.assign(Object.assign({}, registerDto), { password: hashedPassword, signupVerifyToken, isEmailVerified: false }));
        await this.sendVerificationEmail(user.email, signupVerifyToken);
        const payload = { sub: user.id, email: user.email };
        return {
            access_token: this.jwtService.sign(payload),
            message: '인증 이메일을 발송했습니다. 이메일을 확인해주세요.',
        };
    }
    async login(loginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new custom_exceptions_1.InvalidCredentialsException();
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new custom_exceptions_1.InvalidCredentialsException();
        }
        if (!user.isEmailVerified) {
            throw new common_1.UnauthorizedException('이메일 인증이 필요합니다.');
        }
        const payload = { sub: user.id, email: user.email };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
    async verifyEmail(signupVerifyToken) {
        const user = await this.usersService.findOne({
            where: { signupVerifyToken },
        });
        if (!user) {
            throw new common_1.NotFoundException('유효하지 않은 인증 토큰입니다.');
        }
        await this.usersService.update(user.id, {
            signupVerifyToken: null,
            isEmailVerified: true,
        });
        const payload = { sub: user.id, email: user.email };
        return {
            access_token: this.jwtService.sign(payload),
            message: '이메일 인증이 완료되었습니다.',
        };
    }
    verify(token) {
        try {
            return this.jwtService.verify(token);
        }
        catch (e) {
            throw new common_1.UnauthorizedException('유효하지 않은 토큰입니다.');
        }
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map