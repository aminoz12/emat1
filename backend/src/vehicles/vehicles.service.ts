import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import axios from 'axios';

@Injectable()
export class VehiclesService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async decodeVin(vin: string) {
    // Check cache first
    const cached = await this.getCachedVinData(vin);
    if (cached) {
      return cached;
    }

    // Decode VIN using external API
    const decodedData = await this.callVinDecoderApi(vin);
    
    // Cache the result
    await this.cacheVinData(vin, decodedData);
    
    return decodedData;
  }

  private async getCachedVinData(vin: string) {
    // In a real implementation, you would use Redis here
    // For now, we'll check the database
    const existingVehicle = await this.prisma.vehicle.findUnique({
      where: { vin },
    });
    
    return existingVehicle;
  }

  private async cacheVinData(vin: string, data: any) {
    // Store in database for caching
    return this.prisma.vehicle.upsert({
      where: { vin },
      update: data,
      create: {
        vin,
        make: data.make,
        model: data.model,
        year: data.year,
        engine: data.engine,
        fuelType: data.fuelType,
        color: data.color,
        bodyType: data.bodyType,
        weight: data.weight,
        power: data.power,
        displacement: data.displacement,
      },
    });
  }

  private async callVinDecoderApi(vin: string) {
    const apiKey = this.configService.get('VIN_DECODER_API_KEY');
    const baseUrl = this.configService.get('VIN_DECODER_BASE_URL');
    
    try {
      const response = await axios.get(`${baseUrl}/decode`, {
        params: { vin },
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      
      return this.transformVinData(response.data);
    } catch (error) {
      throw new NotFoundException('Unable to decode VIN');
    }
  }

  private transformVinData(apiData: any) {
    return {
      make: apiData.make || 'Unknown',
      model: apiData.model || 'Unknown',
      year: apiData.year || new Date().getFullYear(),
      engine: apiData.engine || null,
      fuelType: apiData.fuel_type || null,
      color: apiData.color || null,
      bodyType: apiData.body_type || null,
      weight: apiData.weight || null,
      power: apiData.power || null,
      displacement: apiData.displacement || null,
    };
  }

  async create(createVehicleDto: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: createVehicleDto,
    });
  }

  async findAll() {
    return this.prisma.vehicle.findMany();
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async findByVin(vin: string) {
    return this.prisma.vehicle.findUnique({
      where: { vin },
    });
  }
}
