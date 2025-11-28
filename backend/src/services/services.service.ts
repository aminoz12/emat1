import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto) {
    return this.prisma.service.create({
      data: createServiceDto,
    });
  }

  async findAll() {
    return this.prisma.service.findMany({
      where: { isActive: true },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    const service = await this.findOne(id);
    
    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  async remove(id: string) {
    const service = await this.findOne(id);
    
    return this.prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getPricing() {
    return this.prisma.pricing.findMany({
      where: { isActive: true },
    });
  }

  async updatePricing(pricingData: any[]) {
    // Clear existing pricing
    await this.prisma.pricing.deleteMany({});
    
    // Create new pricing
    return this.prisma.pricing.createMany({
      data: pricingData,
    });
  }
}
