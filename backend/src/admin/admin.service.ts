import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { ServicesService } from '../services/services.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService,
    private usersService: UsersService,
    private servicesService: ServicesService,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalPrice: true },
      }),
      this.prisma.order.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.order.count({
        where: { status: 'COMPLETED' },
      }),
    ]);

    return {
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      pendingOrders,
      completedOrders,
    };
  }

  async getRecentOrders(limit = 10) {
    return this.prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        vehicle: {
          select: {
            make: true,
            model: true,
            year: true,
          },
        },
        service: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    });
  }

  async getUsers(limit = 50, offset = 0) {
    return this.prisma.user.findMany({
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.ordersService.updateStatus(orderId, status as any);
  }

  async updateServicePricing(pricingData: any[]) {
    return this.servicesService.updatePricing(pricingData);
  }

  async getEmailLogs(limit = 50, offset = 0) {
    return this.prisma.emailLog.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
