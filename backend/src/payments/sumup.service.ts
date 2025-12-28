import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SumUp from '@sumup/sdk';
import { createClient } from '@supabase/supabase-js';

type CheckoutResponse = {
  id: string;
  pay_to_email: string;
  amount: number;
  currency: string;
  checkout_reference: string;
  status: string;
  return_url: string;
  links: Array<{ href: string; rel: string; method: string }>;
};

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
    const supabaseKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY');
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
      throw new Error(`Order not found: ${orderId}`);
    }

    try {
      // Create a checkout with SumUp
      const checkout = await this.sumup.checkouts.create({
        checkout_reference: orderId,
        amount: amount.toFixed(2), // Fix: Properly format amount as decimal string
        currency: currency.toUpperCase(),
        description: `Payment for order ${order.id}`,
        return_url: redirectUrl || `${this.configService.get('FRONTEND_URL')}/payment-callback`,
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
        console.error('Error saving payment:', paymentError);
        throw new Error('Failed to save payment record');
      }

      return {
        checkoutUrl: this.getCheckoutWidgetUrl(checkout),
        checkoutId: checkout.id,  // Added: Make sure we return the checkoutId as expected by frontend
      };
    } catch (error) {
      console.error('SumUp checkout creation error:', error);
      throw new Error(`Failed to create SumUp checkout: ${error.message}`);
    }
  }

  private getCheckoutWidgetUrl(checkout: CheckoutResponse): string {
    // This URL will be used to load the SumUp widget
    return `https://checkout.sumup.com/b/${checkout.id}`;
  }

  async verifyPayment(checkoutId: string): Promise<{ status: string }> {
    try {
      const checkout = await this.sumup.checkouts.get(checkoutId);
      
      // Update payment status in the database
      if (checkout.status === 'PAID') {
        await this.updatePaymentStatus(checkoutId, 'succeeded');
      } else if (['FAILED', 'EXPIRED', 'CANCELLED'].includes(checkout.status)) {
        await this.updatePaymentStatus(checkoutId, 'failed');
      }
      
      return { status: checkout.status };
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new Error('Failed to verify payment status');
    }
  }

  private async updatePaymentStatus(checkoutId: string, status: 'succeeded' | 'failed') {
    const { data: payment, error: paymentError } = await this.supabase
      .from('payments')
      .select('*')
      .eq('sumup_checkout_id', checkoutId)
      .single();

    if (!paymentError && payment) {
      await this.supabase
        .from('payments')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id);
    }
  }
}