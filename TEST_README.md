# 테스트 가이드

이 프로젝트는 유닛테스트와 통합테스트(E2E)를 포함하고 있습니다.

## 테스트 명령어

### 유닛 테스트
```bash
# 모든 유닛 테스트 실행
npm test

# 유닛 테스트만 실행 (E2E 제외)
npm run test:unit

# 테스트 커버리지 포함
npm run test:cov

# 감시 모드로 테스트 실행
npm run test:watch
```

### 통합 테스트 (E2E)
```bash
# E2E 테스트 실행
npm run test:e2e

# 통합 테스트만 실행
npm run test:integration
```

## 테스트 구조

### 유닛 테스트
- `src/users/users.service.spec.ts` - UsersService 테스트
- `src/users/users.controller.spec.ts` - UsersController 테스트
- `src/auth/auth.service.spec.ts` - AuthService 테스트

### 통합 테스트
- `test/app.e2e-spec.ts` - API 엔드포인트 통합 테스트

## 테스트 커버리지

유닛 테스트는 다음 기능들을 커버합니다:

### UsersService
- 이메일로 사용자 찾기
- ID로 사용자 찾기
- 사용자 생성
- 예외 처리

### UsersController
- 사용자 정보 조회 API
- 사용자 정보 업데이트 API
- CQRS 패턴 (Command/Query Bus)

### AuthService
- 사용자 등록
- 로그인
- JWT 토큰 검증
- 비밀번호 해싱/비교

## 테스트 환경 설정

### 테스트용 데이터베이스
E2E 테스트는 별도의 테스트 환경이 필요합니다. 다음 중 하나를 선택하세요:

1. **In-Memory SQLite** (권장)
   - 빠른 테스트 실행
   - 설정이 간단
   - 현재 `TestDbModule`에서 설정됨

2. **별도 MySQL 인스턴스**
   - 프로덕션 환경과 동일한 데이터베이스
   - 더 정확한 테스트 결과

### 모킹 전략

1. **서비스 계층 모킹**
   - Repository 패턴 모킹
   - 외부 서비스 (이메일, JWT) 모킹

2. **Guard 모킹**
   - AuthGuard 우회
   - 인증 로직 분리 테스트

## 테스트 작성 가이드

### 새로운 유닛 테스트 추가
```typescript
import { Test, TestingModule } from '@nestjs/testing';

describe('ServiceName', () => {
  let service: ServiceName;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceName, /* mocked dependencies */],
    }).compile();

    service = module.get<ServiceName>(ServiceName);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### 새로운 E2E 테스트 추가
```typescript
import * as request from 'supertest';

describe('API Endpoint', () => {
  it('should return expected result', () => {
    return request(app.getHttpServer())
      .get('/api/endpoint')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('expectedProperty');
      });
  });
});
```

## 주의사항

1. **테스트 격리**: 각 테스트는 독립적으로 실행되어야 합니다.
2. **데이터 정리**: afterEach에서 테스트 데이터를 정리합니다.
3. **모킹**: 외부 의존성은 모킹하여 테스트 안정성을 높입니다.
4. **타임아웃**: E2E 테스트는 더 긴 타임아웃이 필요할 수 있습니다.

## 트러블슈팅

### 일반적인 문제
1. **의존성 해결 실패**: 모든 필요한 providers가 TestingModule에 포함되어야 합니다.
2. **데이터베이스 연결 실패**: 테스트 환경의 데이터베이스 설정을 확인하세요.
3. **타임아웃**: jest.setTimeout()으로 타임아웃을 조정하세요.

### 디버깅
```bash
# 디버그 모드로 테스트 실행
npm run test:debug

# 열린 핸들 감지
npm test -- --detectOpenHandles
``` 