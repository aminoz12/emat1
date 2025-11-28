import { IsString, IsInt, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ example: '1HGBH41JXMN109186' })
  @IsString()
  vin: string;

  @ApiProperty({ example: 'Honda' })
  @IsString()
  make: string;

  @ApiProperty({ example: 'Civic' })
  @IsString()
  model: string;

  @ApiProperty({ example: 2021 })
  @IsInt()
  year: number;

  @ApiProperty({ example: '1.5L Turbo', required: false })
  @IsString()
  @IsOptional()
  engine?: string;

  @ApiProperty({ example: 'Gasoline', required: false })
  @IsString()
  @IsOptional()
  fuelType?: string;

  @ApiProperty({ example: 'White', required: false })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ example: 'Sedan', required: false })
  @IsString()
  @IsOptional()
  bodyType?: string;

  @ApiProperty({ example: 1500.5, required: false })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({ example: 150, required: false })
  @IsInt()
  @IsOptional()
  power?: number;

  @ApiProperty({ example: '1.5L', required: false })
  @IsString()
  @IsOptional()
  displacement?: string;
}
