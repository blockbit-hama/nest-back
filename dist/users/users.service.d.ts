import { Repository, FindOneOptions } from 'typeorm';
import { User } from './entities/user.entity';
import { Logger } from 'winston';
export declare class UsersService {
    private readonly usersRepository;
    private readonly logger;
    constructor(usersRepository: Repository<User>, logger: Logger);
    findOne(options: FindOneOptions<User>): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User>;
    save(user: User): Promise<User>;
    create(userData: Partial<User>): Promise<User>;
}
