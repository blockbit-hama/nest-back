import * as jwt from 'jsonwebtoken';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  login(user: User) {
    this.logger.info('User login attempt', {
      context: 'AuthService',
      userId: user.id,
      email: user.email,
    });

    try {
      const payload = { ...user };
      const secret = this.configService.get('AUTH_JWT_SECRET');

      this.logger.debug('Generating JWT token', {
        context: 'AuthService',
        userId: user.id,
      });

      const token = jwt.sign(payload, secret, {
        expiresIn: '1d',
        audience: 'nest-wallet',
        issuer: 'nest-wallet',
      });

      this.logger.info('Login successful, token generated', {
        context: 'AuthService',
        userId: user.id,
      });

      return token;
    } catch (error) {
      this.logger.error('Login failed', {
        context: 'AuthService',
        error: error.message,
        userId: user.id,
        email: user.email,
      });
      throw error;
    }
  }

  verify(jwtString: string) {
    this.logger.debug('Verifying JWT token', {
      context: 'AuthService',
      token: jwtString.substring(0, 10) + '...', // 토큰의 일부만 로깅
    });

    try {
      const payload = jwt.verify(
        jwtString,
        this.configService.get('AUTH_JWT_SECRET'),
      ) as jwt.JwtPayload | string;

      const { id, email } = payload as User;

      this.logger.info('Token verified successfully', {
        context: 'AuthService',
        userId: id,
        email,
      });

      return payload;
    } catch (error) {
      this.logger.error('Token verification failed', {
        context: 'AuthService',
        error: error.message,
        token: jwtString.substring(0, 10) + '...',
      });
      throw new UnauthorizedException('Invalid token');
    }
  }
}
