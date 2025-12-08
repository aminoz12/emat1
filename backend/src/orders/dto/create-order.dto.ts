import { IsString, IsInt, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ServiceType {
  CARTE_GRISE = 'carte-grise',
  PLAQUE = 'plaque',
  COC = 'coc'
}

export class CreateOrderDto {
  @ApiProperty({ example: 'clh123456789' })
  @IsString()
  vehicleId: string;

  @ApiProperty({ example: 'clh123456789' })
  @IsString()
  serviceId: string;

  @ApiProperty({ example: 'Standard', required: false })
  @IsString()
  @IsOptional()
  plaqueType?: string;

  @ApiProperty({ example: 'European', required: false })
  @IsString()
  @IsOptional()
  plaqueFormat?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  quantity: number;

  @ApiProperty({ example: 29.90 })
  @IsNumber()
  totalPrice: number;
}
