import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ServiceType {
  CARTE_GRISE = 'carte-grise',
  PLAQUE = 'plaque',
  COC = 'coc'
}

export class CreateServiceDto {
  @ApiProperty({ example: 'Carte Grise Standard' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Service de carte grise standard' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'CARTE_GRISE', enum: ServiceType })
  @IsEnum(ServiceType)
  type: ServiceType;

  @ApiProperty({ example: 29.90 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
