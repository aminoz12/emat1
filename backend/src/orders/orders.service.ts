import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, userId: string) {
    return this.prisma.order.create({
      data: {
        ...createOrderDto,
        userId,
      },
      include: {
        user: true,
        vehicle: true,
        service: true,
        documents: true,
      },
    });
  }

  async findAll(userId?: string, userRole?: string) {
    const where = userRole === 'ADMIN' ? {} : { userId };
    
    return this.prisma.order.findMany({
      where,
      include: {
        user: true,
        vehicle: true,
        service: true,
        documents: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId?: string, userRole?: string) {
    const where: any = { id };
    
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const order = await this.prisma.order.findFirst({
      where,
      include: {
        user: true,
        vehicle: true,
        service: true,
        documents: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto, userId?: string, userRole?: string) {
    const order = await this.findOne(id, userId, userRole);
    
    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
      include: {
        user: true,
        vehicle: true,
        service: true,
        documents: true,
      },
    });
  }

  async updateStatus(id: string, status: OrderStatus, userId?: string, userRole?: string) {
    const order = await this.findOne(id, userId, userRole);
    
    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        vehicle: true,
        service: true,
        documents: true,
      },
    });
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus, stripePaymentId?: string) {
    return this.prisma.order.update({
      where: { id },
      data: { 
        paymentStatus,
        stripePaymentId,
      },
      include: {
        user: true,
        vehicle: true,
        service: true,
        documents: true,
      },
    });
  }

  async remove(id: string, userId?: string, userRole?: string) {
    const order = await this.findOne(id, userId, userRole);
    
    return this.prisma.order.delete({
      where: { id },
    });
  }

  async getOrderStats() {
    const totalOrders = await this.prisma.order.count();
    const pendingOrders = await this.prisma.order.count({
      where: { status: OrderStatus.PENDING },
    });
    const completedOrders = await this.prisma.order.count({
      where: { status: OrderStatus.COMPLETED },
    });
    const totalRevenue = await this.prisma.order.aggregate({
      where: { paymentStatus: PaymentStatus.PAID },
      _sum: { totalPrice: true },
    });

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
    };
  }
}
