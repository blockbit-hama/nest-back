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
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const custom_exceptions_1 = require("../exception/custom-exceptions");
const nest_winston_1 = require("nest-winston");
const winston_1 = require("winston");
let UsersService = class UsersService {
    constructor(usersRepository, logger) {
        this.usersRepository = usersRepository;
        this.logger = logger;
        this.logger.info('UsersService initialized', { context: 'UsersService' });
    }
    async _createUser(userData) {
        this.logger.debug('Creating new user', {
            context: 'UsersService',
            email: userData.email,
        });
        const user = this.usersRepository.create(userData);
        return await this.usersRepository.save(user);
    }
    async findOne(options) {
        return await this.usersRepository.findOne(options);
    }
    async findByEmail(email) {
        this.logger.debug('Finding user by email', {
            context: 'UsersService',
            email,
        });
        return await this.usersRepository.findOne({ where: { email } });
    }
    async findById(id) {
        this.logger.debug('Finding user by id', {
            context: 'UsersService',
            userId: id,
        });
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new custom_exceptions_1.EntityNotFoundException('사용자');
        }
        return user;
    }
    async update(id, updateUserDto) {
        this.logger.debug('Updating user', {
            context: 'UsersService',
            userId: id,
        });
        await this.findById(id);
        await this.usersRepository.update(id, updateUserDto);
        return await this.findById(id);
    }
};
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_PROVIDER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        winston_1.Logger])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map