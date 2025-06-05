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
exports.AuthService = void 0;
const jwt = require("jsonwebtoken");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nest_winston_1 = require("nest-winston");
const winston_1 = require("winston");
let AuthService = class AuthService {
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
    }
    login(user) {
        this.logger.info('User login attempt', {
            context: 'AuthService',
            userId: user.id,
            email: user.email,
        });
        try {
            const payload = Object.assign({}, user);
            const secret = this.configService.get('AUTH_JWT_SECRET');
            this.logger.debug('Generating JWT token', {
                context: 'AuthService',
                userId: user.id,
            });
            const token = jwt.sign(payload, secret, {
                expiresIn: '1d',
                audience: 'nest-wallet',
                issuer: 'nest-wallet',
            });
            this.logger.info('Login successful, token generated', {
                context: 'AuthService',
                userId: user.id,
            });
            return token;
        }
        catch (error) {
            this.logger.error('Login failed', {
                context: 'AuthService',
                error: error.message,
                userId: user.id,
                email: user.email,
            });
            throw error;
        }
    }
    verify(jwtString) {
        this.logger.debug('Verifying JWT token', {
            context: 'AuthService',
            token: jwtString.substring(0, 10) + '...',
        });
        try {
            const payload = jwt.verify(jwtString, this.configService.get('AUTH_JWT_SECRET'));
            const { id, email } = payload;
            this.logger.info('Token verified successfully', {
                context: 'AuthService',
                userId: id,
                email,
            });
            return payload;
        }
        catch (error) {
            this.logger.error('Token verification failed', {
                context: 'AuthService',
                error: error.message,
                token: jwtString.substring(0, 10) + '...',
            });
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_PROVIDER)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        winston_1.Logger])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map