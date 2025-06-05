import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateUserHandler } from './command/update-user.handler';
import { GetUserInfoQueryHandler } from './query/get-user-info.handler';
import { AuthModule } from '../auth/auth.module';

const commandHandlers = [
  UpdateUserHandler,
];

const queryHandlers = [
  GetUserInfoQueryHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
