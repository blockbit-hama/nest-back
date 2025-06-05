import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserInfo } from '../UserInfo';
import { GetUserInfoQuery } from './get-user-info.query';

@QueryHandler(GetUserInfoQuery)
export class GetUserInfoQueryHandler
  implements IQueryHandler<GetUserInfoQuery>
{
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async execute(query: GetUserInfoQuery): Promise<UserInfo> {
    const { userId } = query;

    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
