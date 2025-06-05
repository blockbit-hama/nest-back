import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  InvalidCredentialsException,
  DuplicateEntityException,
} from '../exception/custom-exceptions';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // 이메일 전송을 위한 transporter 초기화
    this.transporter = nodemailer.createTransport({
      service: this.configService.get('EMAIL_SERVICE'),
      auth: {
        user: this.configService.get('EMAIL_AUTH_USER'),
        pass: this.configService.get('EMAIL_AUTH_PASSWORD'),
      },
    });
  }

  private async sendVerificationEmail(
    email: string,
    signupVerifyToken: string,
  ) {
    const baseUrl = this.configService.get('EMAIL_BASE_URL');
    const verificationUrl = `${baseUrl}/auth/verify-email?signupVerifyToken=${signupVerifyToken}`;

    await this.transporter.sendMail({
      to: email,
      subject: '이메일 인증을 완료해주세요.',
      html: `
        <h3>이메일 인증</h3>
        <p>아래 링크를 클릭하여 이메일 인증을 완료해주세요:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
      `,
    });
  }

  async register(registerDto: RegisterDto) {
    // 이메일 중복 체크
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new DuplicateEntityException('이메일');
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // signupVerifyToken 생성
    const signupVerifyToken = uuidv4();

    // 사용자 생성
    const user = await this.usersService._createUser({
      ...registerDto,
      password: hashedPassword,
      signupVerifyToken,
      isEmailVerified: false,
    });

    // 인증 이메일 발송
    await this.sendVerificationEmail(user.email, signupVerifyToken);

    // JWT 토큰 생성
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      message: '인증 이메일을 발송했습니다. 이메일을 확인해주세요.',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // 이메일 인증 확인
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('이메일 인증이 필요합니다.');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verifyEmail(signupVerifyToken: string) {
    const user = await this.usersService.findOne({
      where: { signupVerifyToken },
    });
    if (!user) {
      throw new NotFoundException('유효하지 않은 인증 토큰입니다.');
    }

    // 인증 완료 처리
    await this.usersService.update(user.id, {
      signupVerifyToken: null,
      isEmailVerified: true,
    });

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      message: '이메일 인증이 완료되었습니다.',
    };
  }

  verify(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }
}
