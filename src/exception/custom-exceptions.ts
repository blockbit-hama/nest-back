import { HttpException, HttpStatus } from '@nestjs/common';

export class EntityNotFoundException extends HttpException {
  constructor(entity: string) {
    super(`${entity}를 찾을 수 없습니다.`, HttpStatus.NOT_FOUND);
  }
}

export class DuplicateEntityException extends HttpException {
  constructor(entity: string) {
    super(`이미 존재하는 ${entity}입니다.`, HttpStatus.CONFLICT);
  }
}

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super('잘못된 인증 정보입니다.', HttpStatus.UNAUTHORIZED);
  }
}

export class InsufficientPermissionException extends HttpException {
  constructor() {
    super('권한이 부족합니다.', HttpStatus.FORBIDDEN);
  }
}
