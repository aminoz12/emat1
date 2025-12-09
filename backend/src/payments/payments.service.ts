import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders/orders.service';
import { SumUpService } from './sumup.service';

@Injectable()
export class PaymentsService {
  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
    private sumUpService: SumUpService,
  ) {}

  async createPaymentIntent(orderId: string, amount: number, currency = 'eur') {
    // Create SumUp checkout
    return this.sumUpService.createCheckout(
      orderId, 
      amount, 
      currency.toUpperCase(),
      `${this.configService.get('FRONTEND_URL')}/payment/return?orderId=${orderId}`
    );
  }

  async verifyPayment(checkoutId: string) {
    return this.sumUpService.verifyPayment(checkoutId);
  }

  async handleWebhook(body: any, signature: string) {
    return this.sumUpService.handleWebhook(body, signature);
  }
}