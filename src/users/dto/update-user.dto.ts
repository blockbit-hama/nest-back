import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: '홍길동' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ 
    example: null, 
    description: '이메일 인증 토큰',
    required: false,
    nullable: true 
  })
  @IsString()
  @IsOptional()
  signupVerifyToken?: string | null;

  @ApiProperty({
    example: true,
    description: '이메일 인증 여부',
    required: false
  })
  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;
} 