import { HttpException } from '@nestjs/common';
export declare class EntityNotFoundException extends HttpException {
    constructor(entity: string);
}
export declare class DuplicateEntityException extends HttpException {
    constructor(entity: string);
}
export declare class InvalidCredentialsException extends HttpException {
    constructor();
}
export declare class InsufficientPermissionException extends HttpException {
    constructor();
}
