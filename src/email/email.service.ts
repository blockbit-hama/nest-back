import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.logger.info('Initializing EmailService', { context: 'EmailService' });
    
    this.transporter = nodemailer.createTransport({
      service: this.configService.get('EMAIL_SERVICE'),
      auth: {
        user: this.configService.get('EMAIL_AUTH_USER'),
        pass: this.configService.get('EMAIL_AUTH_PASSWORD'),
      }
    });

    this.logger.info('Email transporter created', { 
      context: 'EmailService',
      service: this.configService.get('EMAIL_SERVICE'),
      user: this.configService.get('EMAIL_AUTH_USER')
    });
  }

  async sendMemberJoinVerification(emailAddress: string, signupVerifyToken: string) {
    this.logger.info('Preparing verification email', { 
      context: 'EmailService',
      to: emailAddress
    });

    const baseUrl = this.configService.get('EMAIL_BASE_URL');
    const url = `${baseUrl}/users/email-verify?signupVerifyToken=${signupVerifyToken}`;

    const mailOptions: EmailOptions = {
      to: emailAddress,
      subject: '가입 인증 메일',
      html: `
        가입확인 버튼를 누르시면 가입 인증이 완료됩니다.<br/>
        <form action="${url}" method="POST">
          <button>가입확인</button>
        </form>
      `
    };

    try {
      this.logger.debug('Sending verification email', { 
        context: 'EmailService',
        to: emailAddress,
        verifyUrl: url
      });

      await this.transporter.sendMail(mailOptions);
      
      this.logger.info('Verification email sent successfully', { 
        context: 'EmailService',
        to: emailAddress
      });
    } catch (error) {
      this.logger.error('Failed to send verification email', { 
        context: 'EmailService',
        error: error.message,
        to: emailAddress
      });
      throw error;
    }
  }
}