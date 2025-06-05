import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserCommand } from './update-user.command';

@Injectable()
@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async execute(command: UpdateUserCommand) {
    const { userId, name, email } = command;

    const user = await this.usersRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    // 업데이트할 필드들만 적용
    if (name !== undefined) {
      user.name = name;
    }
    if (email !== undefined) {
      user.email = email;
    }

    await this.usersRepository.save(user);
    
    return user;
  }
} 