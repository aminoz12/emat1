import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import Stripe from 'stripe';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private ordersService: OrdersService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(orderId: string, amount: number, currency = 'eur') {
    const order = await this.ordersService.findOne(orderId);
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        orderId,
        userId: order.userId,
      },
    });

    // Update order with payment intent ID
    await this.ordersService.updatePaymentStatus(
      orderId,
      PaymentStatus.PENDING,
      undefined,
      paymentIntent.id,
    );

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async confirmPayment(paymentIntentId: string) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      const orderId = paymentIntent.metadata.orderId;
      
      await this.ordersService.updatePaymentStatus(
        orderId,
        PaymentStatus.PAID,
        paymentIntentId,
      );

      return { success: true, orderId };
    }

    return { success: false };
  }

  async handleWebhook(payload: string, signature: string) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.confirmPayment(paymentIntent.id);
          break;
          
        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          await this.handlePaymentFailure(failedPayment.id);
          break;
      }
      
      return { received: true };
    } catch (error) {
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
  }

  private async handlePaymentFailure(paymentIntentId: string) {
    const order = await this.prisma.order.findFirst({
      where: { paymentIntentId },
    });

    if (order) {
      await this.ordersService.updatePaymentStatus(
        order.id,
        PaymentStatus.FAILED,
        paymentIntentId,
      );
    }
  }

  async createRefund(paymentIntentId: string, amount?: number) {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    return refund;
  }
}
