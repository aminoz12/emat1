import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { SumUpService } from './sumup.service';

@Injectable()
export class PaymentsService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private ordersService: OrdersService,
    private sumUpService: SumUpService,
  ) {}

  async createPaymentIntent(orderId: string, amount: number, currency = 'eur') {
    // Create SumUp checkout
    return this.createSumUpCheckout(orderId, amount, currency);
  }

  private async createSumUpCheckout(orderId: string, amount: number, currency = 'eur') {
    // Create SumUp checkout
    const checkout = await this.sumUpService.createCheckout(orderId, amount, currency.toUpperCase());
    
    return {
      checkoutId: checkout.checkoutId,
      checkoutUrl: checkout.checkoutUrl,
    };
  }

  async handleWebhook(payload: string) {
    // Handle SumUp webhook
    return this.sumUpService.handleWebhook(JSON.parse(payload));
  }
}