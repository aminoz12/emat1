import { IsEmail, IsString, IsOptional, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'USER', enum: Role })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiProperty({ example: '+33123456789' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'Paris' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: '75001' })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiProperty({ example: 'FR' })
  @IsString()
  @IsOptional()
  country?: string;
}
