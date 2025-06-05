import * as uuid from 'uuid';
import { ulid } from 'ulid';
import { DataSource, Repository } from 'typeorm';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInfo } from './UserInfo';
import { UserEntity } from './entity/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { EmailService } from 'src/email/email.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class UsersService {
  constructor(
    private emailService: EmailService,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private dataSource: DataSource,
    private authService: AuthService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.logger.info('UsersService initialized', { context: 'UsersService' });
  }

  async createUser(name: string, email: string, password: string) {
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
        throw new UnprocessableEntityException(
          '해당 이메일로는 가입할 수 없습니다.',
        );
      }

      const signupVerifyToken = uuid.v1();

      this.logger.debug('Starting user creation transaction', {
        context: 'UsersService',
        email,
      });

      await this.saveUserUsingTransaction(
        name,
        email,
        password,
        signupVerifyToken,
      );

      this.logger.debug('Sending verification email', {
        context: 'UsersService',
        email,
      });

      await this.sendMemberJoinEmail(email, signupVerifyToken);

      this.logger.info('User created successfully', {
        context: 'UsersService',
        email,
      });
    } catch (error) {
      this.logger.error('Failed to create user', {
        context: 'UsersService',
        error: error.message,
        email,
        name,
      });
      throw error;
    }
  }

  private async checkUserExists(emailAddress: string): Promise<boolean> {
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

  private async saveUserUsingTransaction(
    name: string,
    email: string,
    password: string,
    signupVerifyToken: string,
  ) {
    this.logger.debug('Starting transaction for user creation', {
      context: 'UsersService',
      email,
    });

    try {
      await this.dataSource.transaction(async (manager) => {
        const user = new UserEntity();
        user.id = ulid();
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
    } catch (error) {
      this.logger.error('Transaction failed', {
        context: 'UsersService',
        error: error.message,
        email,
      });
      throw error;
    }
  }

  private async sendMemberJoinEmail(email: string, signupVerifyToken: string) {
    this.logger.debug('Sending member join verification email', {
      context: 'UsersService',
      email,
    });
    await this.emailService.sendMemberJoinVerification(
      email,
      signupVerifyToken,
    );
  }

  async verifyEmail(signupVerifyToken: string): Promise<string> {
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
        throw new NotFoundException('유저가 존재하지 않습니다');
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
    } catch (error) {
      this.logger.error('Email verification failed', {
        context: 'UsersService',
        error: error.message,
        signupVerifyToken,
      });
      throw error;
    }
  }

  async login(email: string, password: string): Promise<string> {
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
        throw new NotFoundException('유저가 존재하지 않습니다');
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
    } catch (error) {
      this.logger.error('Login failed', {
        context: 'UsersService',
        error: error.message,
        email,
      });
      throw error;
    }
  }

  async getUserInfo(userId: string): Promise<UserInfo> {
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
        throw new NotFoundException('유저가 존재하지 않습니다');
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
    } catch (error) {
      this.logger.error('Failed to fetch user info', {
        context: 'UsersService',
        error: error.message,
        userId,
      });
      throw error;
    }
  }
}
