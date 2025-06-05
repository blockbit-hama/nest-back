import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  @MaxLength(60)
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '홍길동' })
  @Transform((params) => params.value.trim())
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name: string;
}
