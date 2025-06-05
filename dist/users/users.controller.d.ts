import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserInfo } from './UserInfo';
export declare class UsersController {
    private commandBus;
    private queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    findOne(id: string): Promise<UserInfo>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<any>;
}
