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
  hosted_checkout_url?: string; // Public checkout URL when hosted_checkout is enabled
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
      // Create a hosted checkout with SumUp (public payment enabled)
      const checkoutData = {
        checkout_reference: orderId,
        amount: amount.toFixed(2), // Fix: Properly format amount as decimal string
        currency: currency.toUpperCase(),
        description: `Payment for order ${order.id}`,
        return_url: redirectUrl || `${this.configService.get('FRONTEND_URL')}/payment-callback`,
        hosted_checkout: {
          enabled: true  // CRITICAL: Enables public/guest payment without SumUp account
        }
      };

      console.log('Creating SumUp hosted checkout with public payment enabled:', {
        hosted_checkout: { enabled: true }
      });

      const checkout = await this.sumup.checkouts.create(checkoutData);

      // Log all links returned by SumUp for debugging
      console.log('SumUp checkout created:', {
        id: checkout.id,
        status: checkout.status,
        hosted_checkout_url: checkout.hosted_checkout_url,
        links: checkout.links
      });

      if (checkout.links && checkout.links.length > 0) {
        console.log('=== SUMUP LINKS DETAILS ===');
        checkout.links.forEach((link: any, index: number) => {
          console.log(`Link ${index + 1}:`, {
            href: link.href,
            rel: link.rel,
            method: link.method
          });
        });
      }

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

      // Get the public checkout URL
      const checkoutUrl = this.getCheckoutWidgetUrl(checkout);
      
      return {
        checkoutUrl: checkoutUrl,
        checkoutId: checkout.id,  // Added: Make sure we return the checkoutId as expected by frontend
      };
    } catch (error) {
      console.error('SumUp checkout creation error:', error);
      throw new Error(`Failed to create SumUp checkout: ${error.message}`);
    }
  }

  private getCheckoutWidgetUrl(checkout: CheckoutResponse): string {
    // PRIORITY 1: Use hosted_checkout_url if available (direct public checkout URL)
    if (checkout.hosted_checkout_url) {
      console.log('✅ Found hosted_checkout_url directly in response (PUBLIC CHECKOUT URL):', checkout.hosted_checkout_url);
      return checkout.hosted_checkout_url;
    }

    // PRIORITY 2: Extract from links array
    if (checkout.links && checkout.links.length > 0) {
      // Look for a link that seems to be a public checkout URL
      // Prefer links with 'checkout' in rel or href, and avoid API/internal URLs
      const publicCheckoutLink = checkout.links.find((link: any) => {
        const href = link.href?.toLowerCase() || '';
        const rel = link.rel?.toLowerCase() || '';
        
        // Avoid API/internal URLs
        if (href.includes('/api/') || href.includes('/login') || href.includes('/auth') || href.includes('/merchant') || href.includes('/dashboard')) {
          return false;
        }
        
        // Prefer URLs with 'checkout' or 'pay' in them
        return (href.includes('checkout') || href.includes('pay') || rel.includes('checkout')) && 
               (href.includes('me.sumup.com') || href.includes('pay.sumup.com') || href.includes('checkout.sumup.com'));
      });

      if (publicCheckoutLink?.href) {
        console.log('✅ Using URL from links (PUBLIC CHECKOUT URL):', publicCheckoutLink.href);
        return publicCheckoutLink.href;
      }

      // Fallback: Use first link that's not an API URL
      const fallbackLink = checkout.links.find((link: any) => {
        const href = link.href?.toLowerCase() || '';
        return !href.includes('/api/') && !href.includes('/login') && !href.includes('/auth');
      });

      if (fallbackLink?.href) {
        console.log('⚠️ Using fallback link from links:', fallbackLink.href);
        return fallbackLink.href;
      }

      console.log('⚠️ No suitable link found in checkout.links, using default format');
    }

    // PRIORITY 3: Fallback to default format (may not work for hosted checkouts)
    const fallbackUrl = `https://checkout.sumup.com/b/${checkout.id}`;
    console.log('⚠️ No hosted_checkout_url found, using default format:', fallbackUrl);
    return fallbackUrl;
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