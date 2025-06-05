import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserCommand } from './command/update-user.command';
import { GetUserInfoQuery } from './query/get-user-info.query';
import { UserInfo } from './UserInfo';

@Controller('users')
export class UsersController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string): Promise<UserInfo> {
    const getUserInfoQuery = new GetUserInfoQuery(id);
    return this.queryBus.execute(getUserInfoQuery);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const { name, email } = updateUserDto;
    const updateUserCommand = new UpdateUserCommand(id, name, email);
    return this.commandBus.execute(updateUserCommand);
  }
}
