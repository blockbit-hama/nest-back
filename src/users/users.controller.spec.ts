import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UsersController } from './users.controller';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserCommand } from './command/update-user.command';
import { GetUserInfoQuery } from './query/get-user-info.query';
import { UserInfo } from './UserInfo';
import { AuthService } from '../auth/auth.service';

describe('UsersController', () => {
  let controller: UsersController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  const mockUserInfo: UserInfo = {
    id: '01234567-89ab-cdef-0123-456789abcdef',
    email: 'test@example.com',
    name: '테스트 사용자',
  };

  const mockCommandBus = {
    execute: jest.fn(),
  };

  const mockQueryBus = {
    execute: jest.fn(),
  };

  const mockAuthService = {
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return user info', async () => {
      mockQueryBus.execute.mockResolvedValue(mockUserInfo);

      const result = await controller.findOne('test-id');

      expect(result).toEqual(mockUserInfo);
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        new GetUserInfoQuery('test-id'),
      );
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const updateDto: UpdateUserDto = {
        name: '새로운 이름',
        email: 'new@example.com',
      };

      const updatedUser = { ...mockUserInfo, ...updateDto };
      mockCommandBus.execute.mockResolvedValue(updatedUser);

      const result = await controller.update('test-id', updateDto);

      expect(result).toEqual(updatedUser);
      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new UpdateUserCommand('test-id', updateDto.name, updateDto.email),
      );
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
}); 