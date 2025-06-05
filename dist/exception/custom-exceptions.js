"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsufficientPermissionException = exports.InvalidCredentialsException = exports.DuplicateEntityException = exports.EntityNotFoundException = void 0;
const common_1 = require("@nestjs/common");
class EntityNotFoundException extends common_1.HttpException {
    constructor(entity) {
        super(`${entity}를 찾을 수 없습니다.`, common_1.HttpStatus.NOT_FOUND);
    }
}
exports.EntityNotFoundException = EntityNotFoundException;
class DuplicateEntityException extends common_1.HttpException {
    constructor(entity) {
        super(`이미 존재하는 ${entity}입니다.`, common_1.HttpStatus.CONFLICT);
    }
}
exports.DuplicateEntityException = DuplicateEntityException;
class InvalidCredentialsException extends common_1.HttpException {
    constructor() {
        super('잘못된 인증 정보입니다.', common_1.HttpStatus.UNAUTHORIZED);
    }
}
exports.InvalidCredentialsException = InvalidCredentialsException;
class InsufficientPermissionException extends common_1.HttpException {
    constructor() {
        super('권한이 부족합니다.', common_1.HttpStatus.FORBIDDEN);
    }
}
exports.InsufficientPermissionException = InsufficientPermissionException;
//# sourceMappingURL=custom-exceptions.js.map