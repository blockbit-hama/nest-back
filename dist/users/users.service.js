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
exports.UsersService = void 0;
const uuid = require("uuid");
const ulid_1 = require("ulid");
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const user_entity_1 = require("./entity/user.entity");
const auth_service_1 = require("../auth/auth.service");
const email_service_1 = require("../email/email.service");
const nest_winston_1 = require("nest-winston");
const winston_1 = require("winston");
let UsersService = class UsersService {
    constructor(emailService, usersRepository, dataSource, authService, logger) {
        this.emailService = emailService;
        this.usersRepository = usersRepository;
        this.dataSource = dataSource;
        this.authService = authService;
        this.logger = logger;
        this.logger.info('UsersService initialized', { context: 'UsersService' });
    }
    async createUser(name, email, password) {
        this.logger.info('Creating new user', {
            context: 'UsersService',
            email,
            name,
        });
        try {
            const userExist = await this.checkUserExists(email);
            if (userExist) {
                this.logger.warn('User already exists', {
                    context: 'UsersService',
                    email,
                });
                throw new common_1.UnprocessableEntityException('해당 이메일로는 가입할 수 없습니다.');
            }
            const signupVerifyToken = uuid.v1();
            this.logger.debug('Starting user creation transaction', {
                context: 'UsersService',
                email,
            });
            await this.saveUserUsingTransaction(name, email, password, signupVerifyToken);
            this.logger.debug('Sending verification email', {
                context: 'UsersService',
                email,
            });
            await this.sendMemberJoinEmail(email, signupVerifyToken);
            this.logger.info('User created successfully', {
                context: 'UsersService',
                email,
            });
        }
        catch (error) {
            this.logger.error('Failed to create user', {
                context: 'UsersService',
                error: error.message,
                email,
                name,
            });
            throw error;
        }
    }
    async checkUserExists(emailAddress) {
        this.logger.debug('Checking if user exists', {
            context: 'UsersService',
            email: emailAddress,
        });
        const user = await this.usersRepository.findOne({
            where: { email: emailAddress },
        });
        const exists = user !== null;
        this.logger.debug('User existence check result', {
            context: 'UsersService',
            email: emailAddress,
            exists,
        });
        return exists;
    }
    async saveUserUsingTransaction(name, email, password, signupVerifyToken) {
        this.logger.debug('Starting transaction for user creation', {
            context: 'UsersService',
            email,
        });
        try {
            await this.dataSource.transaction(async (manager) => {
                const user = new user_entity_1.UserEntity();
                user.id = (0, ulid_1.ulid)();
                user.name = name;
                user.email = email;
                user.password = password;
                user.signupVerifyToken = signupVerifyToken;
                await manager.save(user);
                this.logger.debug('User saved in transaction', {
                    context: 'UsersService',
                    userId: user.id,
                    email,
                });
            });
        }
        catch (error) {
            this.logger.error('Transaction failed', {
                context: 'UsersService',
                error: error.message,
                email,
            });
            throw error;
        }
    }
    async sendMemberJoinEmail(email, signupVerifyToken) {
        this.logger.debug('Sending member join verification email', {
            context: 'UsersService',
            email,
        });
        await this.emailService.sendMemberJoinVerification(email, signupVerifyToken);
    }
    async verifyEmail(signupVerifyToken) {
        this.logger.info('Verifying email token', {
            context: 'UsersService',
            signupVerifyToken,
        });
        try {
            const user = await this.usersRepository.findOne({
                where: { signupVerifyToken },
            });
            if (!user) {
                this.logger.warn('User not found for verification token', {
                    context: 'UsersService',
                    signupVerifyToken,
                });
                throw new common_1.NotFoundException('유저가 존재하지 않습니다');
            }
            this.logger.info('Email verified successfully', {
                context: 'UsersService',
                userId: user.id,
                email: user.email,
            });
            return this.authService.login({
                id: user.id,
                name: user.name,
                email: user.email,
            });
        }
        catch (error) {
            this.logger.error('Email verification failed', {
                context: 'UsersService',
                error: error.message,
                signupVerifyToken,
            });
            throw error;
        }
    }
    async login(email, password) {
        this.logger.info('User login attempt', {
            context: 'UsersService',
            email,
        });
        try {
            const user = await this.usersRepository.findOne({
                where: { email, password },
            });
            if (!user) {
                this.logger.warn('Login failed - user not found', {
                    context: 'UsersService',
                    email,
                });
                throw new common_1.NotFoundException('유저가 존재하지 않습니다');
            }
            this.logger.info('Login successful', {
                context: 'UsersService',
                userId: user.id,
                email,
            });
            return this.authService.login({
                id: user.id,
                name: user.name,
                email: user.email,
            });
        }
        catch (error) {
            this.logger.error('Login failed', {
                context: 'UsersService',
                error: error.message,
                email,
            });
            throw error;
        }
    }
    async getUserInfo(userId) {
        this.logger.info('Fetching user info', {
            context: 'UsersService',
            userId,
        });
        try {
            const user = await this.usersRepository.findOne({
                where: { id: userId },
            });
            if (!user) {
                this.logger.warn('User not found', {
                    context: 'UsersService',
                    userId,
                });
                throw new common_1.NotFoundException('유저가 존재하지 않습니다');
            }
            this.logger.debug('User info retrieved successfully', {
                context: 'UsersService',
                userId,
                email: user.email,
            });
            return {
                id: user.id,
                name: user.name,
                email: user.email,
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch user info', {
                context: 'UsersService',
                error: error.message,
                userId,
            });
            throw error;
        }
    }
};
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_2.InjectRepository)(user_entity_1.UserEntity)),
    __param(4, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_PROVIDER)),
    __metadata("design:paramtypes", [email_service_1.EmailService,
        typeorm_1.Repository,
        typeorm_1.DataSource,
        auth_service_1.AuthService,
        winston_1.Logger])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map