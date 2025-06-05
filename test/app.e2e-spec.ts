import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';

describe('App E2E', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // 테스트 간 데이터 정리
    await userRepository.query('DELETE FROM user');
  });

  describe('Health Check', () => {
    describe('/health-check (GET)', () => {
      it('should return health status', () => {
        return request(app.getHttpServer())
          .get('/health-check')
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('status');
            expect(res.body.status).toBe('ok');
          });
      });
    });
  });

  describe('Authentication', () => {
    describe('/auth/register (POST)', () => {
      it('should register a new user', () => {
        return request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'test@example.com',
            password: 'password123',
            name: '테스트 사용자',
          })
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('access_token');
            expect(res.body).toHaveProperty('message');
            authToken = res.body.access_token;
          });
      });

      it('should return 409 for duplicate email', async () => {
        // 먼저 사용자 등록
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'test@example.com',
            password: 'password123',
            name: '테스트 사용자',
          });

        // 같은 이메일로 다시 등록 시도
        return request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'test@example.com',
            password: 'password456',
            name: '다른 사용자',
          })
          .expect(409);
      });
    });

    describe('/auth/login (POST)', () => {
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'test@example.com',
            password: 'password123',
            name: '테스트 사용자',
          });

        // 이메일 인증 처리 (테스트에서는 직접 처리)
        const user = await userRepository.findOne({
          where: { email: 'test@example.com' }
        });
        if (user) {
          user.isEmailVerified = true;
          await userRepository.save(user);
        }
      });

      it('should login successfully', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123',
          })
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('access_token');
            authToken = res.body.access_token;
          });
      });

      it('should return 401 for invalid credentials', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword',
          })
          .expect(401);
      });
    });
  });

  describe('Users', () => {
    beforeEach(async () => {
      // 사용자 등록 및 인증
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: '테스트 사용자',
        });

      authToken = response.body.access_token;

      // 사용자 ID 가져오기
      const user = await userRepository.findOne({
        where: { email: 'test@example.com' }
      });
      userId = user?.id || '';
    });

    describe('/users/:id (GET)', () => {
      it('should get user info with valid token', () => {
        return request(app.getHttpServer())
          .get(`/users/${userId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('id');
            expect(res.body).toHaveProperty('email');
            expect(res.body).toHaveProperty('name');
            expect(res.body.email).toBe('test@example.com');
          });
      });

      it('should return 401 without token', () => {
        return request(app.getHttpServer())
          .get(`/users/${userId}`)
          .expect(401);
      });
    });

    describe('/users/:id (PATCH)', () => {
      it('should update user info', () => {
        return request(app.getHttpServer())
          .patch(`/users/${userId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: '수정된 이름',
            email: 'updated@example.com',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.name).toBe('수정된 이름');
            expect(res.body.email).toBe('updated@example.com');
          });
      });

      it('should return 401 without token', () => {
        return request(app.getHttpServer())
          .patch(`/users/${userId}`)
          .send({
            name: '수정된 이름',
          })
          .expect(401);
      });
    });
  });
}); 