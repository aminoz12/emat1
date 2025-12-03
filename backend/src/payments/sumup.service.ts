import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SumUp from '@sumup/sdk';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SumUpService {
  private sumup: any;
  private supabase: any;

  constructor(
    private configService: ConfigService,
  ) {
    this.sumup = new SumUp({
      apiKey: this.configService.get('SUMUP_API_KEY'),
    });
    
    // Initialize Supabase client
    const supabaseUrl = this.configService.get('SUPABASE_URL');
    const supabaseKey = this.configService.get('SUPABASE_SERVICE_KEY');
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async createCheckout(orderId: string, amount: number, currency = 'EUR', redirectUrl?: string) {
    // Get order details from Supabase
    const { data: order, error: orderError } = await this.supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    try {
      // Create a checkout with SumUp
      const checkout = await this.sumup.checkouts.create({
        amount,
        currency,
        merchant_code: this.configService.get('SUMUP_MERCHANT_CODE'),
        redirect_url: redirectUrl || `${this.configService.get('FRONTEND_URL')}/payment-success`,
        description: `Payment for order ${order.id}`,
        reference: order.id,
        payment_type: 'card', // Default to card payment
      });

      // Update payment record with SumUp checkout ID
      const { data: payment, error: paymentError } = await this.supabase
        .from('payments')
        .upsert({
          order_id: orderId,
          amount: amount,
          currency: currency,
          sumup_checkout_id: checkout.id,
          status: 'pending',
        }, {
          onConflict: 'order_id'
        });

      if (paymentError) {
        throw new Error(`Failed to update payment record: ${paymentError.message}`);
      }

      // Update order status to pending
      await this.supabase
        .from('orders')
        .update({ status: 'pending' })
        .eq('id', orderId);

      return {
        checkoutId: checkout.id,
        checkoutUrl: checkout.pay_to_url,
      };
    } catch (error) {
      console.error('SumUp checkout creation error:', error);
      throw new Error(`Failed to create SumUp checkout: ${error.message}`);
    }
  }

  async getCheckoutStatus(checkoutId: string) {
    try {
      return await this.sumup.checkouts.get(checkoutId);
    } catch (error) {
      console.error('SumUp checkout status error:', error);
      throw new Error(`Failed to get SumUp checkout status: ${error.message}`);
    }
  }

  async handleWebhook(payload: any) {
    // Handle SumUp webhook notifications
    // This would process payment status updates from SumUp
    const { event_type, data } = payload;
    
    switch (event_type) {
      case 'CHECKOUT.SUCCEEDED':
        await this.processSuccessfulPayment(data.id);
        break;
      case 'CHECKOUT.FAILED':
        await this.processFailedPayment(data.id);
        break;
      default:
        console.log(`Unhandled SumUp event type: ${event_type}`);
    }
    
    return { received: true };
  }

  private async processSuccessfulPayment(checkoutId: string) {
    // Find payment by checkout ID
    const { data: payment, error: paymentError } = await this.supabase
      .from('payments')
      .select('*')
      .eq('sumup_checkout_id', checkoutId)
      .single();

    if (!paymentError && payment) {
      // Update payment status to succeeded
      await this.supabase
        .from('payments')
        .update({ 
          status: 'succeeded',
          sumup_checkout_id: checkoutId,
        })
        .eq('id', payment.id);
        
      // Update order status to completed
      await this.supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', payment.order_id);
    }
  }

  private async processFailedPayment(checkoutId: string) {
    // Find payment by checkout ID
    const { data: payment, error: paymentError } = await this.supabase
      .from('payments')
      .select('*')
      .eq('sumup_checkout_id', checkoutId)
      .single();

    if (!paymentError && payment) {
      // Update payment status to failed
      await this.supabase
        .from('payments')
        .update({ 
          status: 'failed',
          sumup_checkout_id: checkoutId,
        })
        .eq('id', payment.id);
        
      // Update order status to cancelled
      await this.supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', payment.order_id);
    }
  }
}