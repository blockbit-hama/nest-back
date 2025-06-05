import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { EntityNotFoundException } from '../exception/custom-exceptions';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.logger.info('UsersService initialized', { context: 'UsersService' });
  }

  // AuthService에서만 사용하는 내부 메서드
  async _createUser(userData: Partial<User>): Promise<User> {
    this.logger.debug('Creating new user', {
      context: 'UsersService',
      email: userData.email,
    });

    const user = this.usersRepository.create(userData);
    return await this.usersRepository.save(user);
  }

  async findOne(options: FindOneOptions<User>): Promise<User | null> {
    return await this.usersRepository.findOne(options);
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.debug('Finding user by email', {
      context: 'UsersService',
      email,
    });

    return await this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    this.logger.debug('Finding user by id', {
      context: 'UsersService',
      userId: id,
    });

    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new EntityNotFoundException('사용자');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.debug('Updating user', {
      context: 'UsersService',
      userId: id,
    });

    await this.findById(id);
    await this.usersRepository.update(id, updateUserDto);
    return await this.findById(id);
  }
}
