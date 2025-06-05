import { Repository, FindOneOptions } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Logger } from 'winston';
export declare class UsersService {
    private readonly usersRepository;
    private readonly logger;
    constructor(usersRepository: Repository<User>, logger: Logger);
    _createUser(userData: Partial<User>): Promise<User>;
    findOne(options: FindOneOptions<User>): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
}
