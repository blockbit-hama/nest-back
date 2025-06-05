import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { DuplicateEntityException } from '../exception/custom-exceptions';
import * as bcrypt from 'bcrypt';

// bcrypt와 nodemailer를 모킹
jest.mock('bcrypt');
jest.mock('nodemailer');

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const nodemailer = require('nodemailer');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let usersRepository: Repository<User>;

  const mockUser: User = {
    id: '01234567-89ab-cdef-0123-456789abcdef',
    email: 'test@example.com',
    password: 'hashed_password',
    name: '테스트 사용자',
    signupVerifyToken: 'verify-token',
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockUsersRepository = {
    save: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockTransporter = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    // nodemailer 모킹 설정
    nodemailer.createTransport.mockReturnValue(mockTransporter);
    mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      name: '테스트 사용자',
    };

    it('should register a new user successfully', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashed_password' as never);
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt_token');
      mockConfigService.get.mockReturnValue('test_value');

      const result = await service.register(registerDto);

      expect(result).toEqual({
        access_token: 'jwt_token',
        message: '인증 이메일을 발송했습니다. 이메일을 확인해주세요.',
      });
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockTransporter.sendMail).toHaveBeenCalled();
    });

    it('should throw DuplicateEntityException if user already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        DuplicateEntityException,
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue('jwt_token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: 'jwt_token',
      });
    });

    it('should throw InvalidCredentialsException for wrong password', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow();
    });
  });

  describe('verify', () => {
    it('should verify token successfully', () => {
      const token = 'valid_token';
      const payload = { sub: mockUser.id, email: mockUser.email };
      mockJwtService.verify.mockReturnValue(payload);

      const result = service.verify(token);

      expect(result).toEqual(payload);
      expect(mockJwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should throw UnauthorizedException for invalid token', () => {
      const token = 'invalid_token';
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => service.verify(token)).toThrow();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
}); 