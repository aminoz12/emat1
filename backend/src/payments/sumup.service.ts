import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
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
    const sumupApiKey = this.configService.get('SUMUP_API_KEY');
    
    if (!sumupApiKey) {
      console.error('⚠️ SUMUP_API_KEY is not set in environment variables');
      throw new Error('SUMUP_API_KEY is required but not configured');
    }

    // Log key type for debugging (without exposing the full key)
    const keyType = sumupApiKey.startsWith('sup_pk_') ? 'Public Key' : 
                   sumupApiKey.startsWith('sup_sk_') ? 'Secret Key' : 'Unknown';
    console.log(`✅ SumUp API Key loaded (Type: ${keyType})`);

    // Warn if using public key for backend operations
    if (sumupApiKey.startsWith('sup_pk_')) {
      console.warn('⚠️ WARNING: Using a public key for backend operations. SumUp backend operations typically require a secret key (sup_sk_...).');
    }

    this.sumup = new SumUp({
      apiKey: sumupApiKey,
    });
    
    // Initialize Supabase client
    const supabaseUrl = this.configService.get('SUPABASE_URL');
    const supabaseKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('⚠️ Supabase credentials are not set');
      throw new Error('Supabase credentials are required');
    }
    
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

    // Get merchant code from environment or use default
    const merchantCode = this.configService.get('SUMUP_MERCHANT_CODE');
    if (!merchantCode) {
      console.warn('⚠️ SUMUP_MERCHANT_CODE is not set. This is required for checkout creation.');
      throw new Error('SUMUP_MERCHANT_CODE is required but not configured. Please set it in your environment variables.');
    }

    try {
      // Ensure amount is a number (not string) and properly formatted
      // SumUp API expects amount as a number (in the currency's smallest unit, e.g., cents for EUR)
      // But based on the SDK types, it accepts decimal numbers
      const checkoutAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      
      // Validate amount
      if (isNaN(checkoutAmount) || checkoutAmount <= 0) {
        throw new Error(`Invalid amount: ${amount}. Amount must be a positive number.`);
      }

      const returnUrl = redirectUrl || `${this.configService.get('FRONTEND_URL')}/payment/return?orderId=${orderId}`;
      
      console.log('Creating SumUp checkout with:', {
        orderId,
        amount: checkoutAmount,
        currency: currency.toUpperCase(),
        merchantCode,
        returnUrl
      });
      
      // Create a checkout with SumUp
      const checkout = await this.sumup.checkouts.create({
        checkout_reference: orderId,
        amount: checkoutAmount, // API expects number, not string
        currency: currency.toUpperCase() as any,
        merchant_code: merchantCode, // Required field
        description: `Payment for order ${order.id}`,
        return_url: returnUrl,
      });

      // Log the full checkout response for debugging
      console.log('SumUp checkout created:', {
        id: checkout.id,
        status: checkout.status,
        amount: checkout.amount,
        currency: checkout.currency,
        links: checkout.links,
        fullResponse: JSON.stringify(checkout, null, 2)
      });

      // Check if payment record already exists
      const { data: existingPayment } = await this.supabase
        .from('payments')
        .select('id')
        .eq('order_id', orderId)
        .single();

      let paymentError: any = null;
      let payment: any = null;

      if (existingPayment) {
        // Update existing payment record
        const { data, error } = await this.supabase
          .from('payments')
          .update({
            amount: amount,
            currency: currency,
            sumup_checkout_id: checkout.id,
            status: 'pending',
            updated_at: new Date().toISOString(),
          })
          .eq('order_id', orderId)
          .select()
          .single();
        
        payment = data;
        paymentError = error;
      } else {
        // Insert new payment record
        const { data, error } = await this.supabase
          .from('payments')
          .insert({
            order_id: orderId,
            amount: amount,
            currency: currency,
            sumup_checkout_id: checkout.id,
            status: 'pending',
          })
          .select()
          .single();
        
        payment = data;
        paymentError = error;
      }

      if (paymentError) {
        console.error('Error saving payment:', paymentError);
        console.error('Payment error details:', {
          message: paymentError.message,
          code: paymentError.code,
          details: paymentError.details,
          hint: paymentError.hint,
          orderId,
          checkoutId: checkout.id
        });
        throw new Error(`Failed to save payment record: ${paymentError.message || 'Unknown error'}`);
      }

      // Get the checkout URL using the helper method
      const checkoutUrl = this.getCheckoutWidgetUrl(checkout);

      console.log('Checkout created successfully:', {
        id: checkout.id,
        status: checkout.status,
        checkoutUrl,
        links: checkout.links,
        amount: checkout.amount,
        currency: checkout.currency
      });

      return {
        checkoutUrl: checkoutUrl,
        checkoutId: checkout.id,  // Added: Make sure we return the checkoutId as expected by frontend
      };
    } catch (error: any) {
      console.error('SumUp checkout creation error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
        error: error.error,
        stack: error.stack
      });
      
      // Check for geographic block
      const errorMessage = error.message || error.error?.message || '';
      const errorString = JSON.stringify(error).toLowerCase();
      
      if (error.status === 403 || error.response?.status === 403 || 
          errorMessage.includes('banned') || errorMessage.includes('country') ||
          errorString.includes('access denied') || errorString.includes('error 1009')) {
        throw new HttpException(
          {
            statusCode: 403,
            message: 'SumUp API access denied. Your country/region (Morocco) is blocked by SumUp. Solutions: 1) Use a VPN from an allowed region (EU/US), 2) Deploy backend to EU/US server, 3) Contact SumUp support.',
            error: 'Geographic Restriction'
          },
          HttpStatus.FORBIDDEN
        );
      }
      
      // Other SumUp API errors
      if (error.status || error.response?.status) {
        throw new HttpException(
          {
            statusCode: error.status || error.response?.status || 500,
            message: `SumUp API error: ${errorMessage || 'Unknown error'}`,
            error: 'SumUp API Error'
          },
          error.status || error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      
      // Generic error
      throw new HttpException(
        {
          statusCode: 500,
          message: `Failed to create SumUp checkout: ${errorMessage || 'Unknown error'}`,
          error: 'Internal Server Error'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private getCheckoutWidgetUrl(checkout: CheckoutResponse): string {
    // SumUp widget URL format - try multiple possible formats
    // Format 1: https://checkout.sumup.com/b/{checkout_id} (standard widget)
    // Format 2: https://me.sumup.com/checkout/{checkout_id} (alternative)
    // Format 3: Use the link from the response if available
    
    // First, try to get URL from links array (most reliable)
    if (checkout.links && checkout.links.length > 0) {
      console.log('Available links from SumUp:', checkout.links);
      
      // Try to find checkout link by rel
      let checkoutLink = checkout.links.find(link => 
        link.rel === 'checkout' || link.rel === 'self'
      );
      
      // If not found by rel, try by href pattern
      if (!checkoutLink) {
        checkoutLink = checkout.links.find(link => 
          link.href.includes('checkout') || 
          link.href.includes('/b/') ||
          link.href.includes('sumup.com')
        );
      }
      
      // If still not found, use first GET link
      if (!checkoutLink) {
        checkoutLink = checkout.links.find(link => link.method === 'GET');
      }
      
      if (checkoutLink && checkoutLink.href) {
        console.log('Using checkout URL from links:', checkoutLink.href);
        return checkoutLink.href;
      }
    }
    
    // Fallback: construct URL manually
    // Try multiple possible formats
    const possibleUrls = [
      `https://checkout.sumup.com/b/${checkout.id}`,  // Standard widget format
      `https://me.sumup.com/checkout/${checkout.id}`,  // Alternative format
      `https://checkout.sumup.com/checkout/${checkout.id}`,  // Alternative format 2
    ];
    
    // Use the first format (most common)
    const widgetUrl = possibleUrls[0];
    console.log('Using constructed checkout URL (fallback):', widgetUrl);
    console.warn('⚠️ No checkout URL found in links array. Using constructed URL. This might not work if SumUp format has changed.');
    return widgetUrl;
  }

  async verifyPayment(checkoutId: string): Promise<{ status: string }> {
    try {
      console.log('Verifying payment for checkout:', checkoutId);
      const checkout = await this.sumup.checkouts.get(checkoutId);
      
      console.log('Checkout status from SumUp:', {
        id: checkout.id,
        status: checkout.status,
        amount: checkout.amount,
        currency: checkout.currency
      });
      
      // Update payment status in the database
      // SumUp status values: "PENDING" | "FAILED" | "PAID"
      if (checkout.status === 'PAID') {
        console.log('Payment is PAID, updating to succeeded');
        await this.updatePaymentStatus(checkoutId, 'succeeded');
      } else if (checkout.status === 'FAILED') {
        console.log('Payment is FAILED, updating to failed');
        await this.updatePaymentStatus(checkoutId, 'failed');
      } else {
        console.log('Payment is still PENDING');
      }
      
      return { status: checkout.status };
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack
      });
      throw new Error(`Failed to verify payment status: ${error.message || 'Unknown error'}`);
    }
  }

  private async updatePaymentStatus(checkoutId: string, status: 'succeeded' | 'failed') {
    try {
      console.log('Updating payment status:', { checkoutId, status });
      
      const { data: payment, error: paymentError } = await this.supabase
        .from('payments')
        .select('*')
        .eq('sumup_checkout_id', checkoutId)
        .single();

      if (paymentError) {
        console.error('Error finding payment:', paymentError);
        throw new Error(`Payment not found for checkout ${checkoutId}: ${paymentError.message}`);
      }

      if (!payment) {
        console.error('Payment not found for checkout:', checkoutId);
        throw new Error(`Payment not found for checkout ${checkoutId}`);
      }

      console.log('Found payment:', { id: payment.id, order_id: payment.order_id });

      // Update payment status
      const { error: updateError } = await this.supabase
        .from('payments')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      if (updateError) {
        console.error('Error updating payment:', updateError);
        throw new Error(`Failed to update payment: ${updateError.message}`);
      }

      console.log('Payment status updated successfully');

      // Update order status when payment succeeds
      if (status === 'succeeded') {
        console.log('Updating order status to paid');
        const { error: orderUpdateError } = await this.supabase
          .from('orders')
          .update({ 
            status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.order_id);

        if (orderUpdateError) {
          console.error('Error updating order status:', orderUpdateError);
          // Don't throw - payment is already updated, order update is secondary
        } else {
          console.log('Order status updated to paid');
        }
      }
    } catch (error: any) {
      console.error('Error in updatePaymentStatus:', error);
      throw error;
    }
  }

  async handleWebhook(body: any, signature: string) {
    try {
      // Verify webhook signature if SumUp provides one
      // Note: SumUp webhook signature verification should be implemented based on their documentation
      // For now, we'll process the webhook and log the signature for verification

      const eventType = body.type || body.event_type;
      const checkoutId = body.checkout_id || body.id;
      const checkoutReference = body.checkout_reference;

      console.log('SumUp webhook received:', { eventType, checkoutId, checkoutReference, signature });

      if (!checkoutId) {
        console.error('Webhook missing checkout_id');
        return { received: true };
      }

      // Verify payment status
      const checkout = await this.sumup.checkouts.get(checkoutId);
      
      // SumUp status values: "PENDING" | "FAILED" | "PAID"
      if (checkout.status === 'PAID') {
        await this.updatePaymentStatus(checkoutId, 'succeeded');
        console.log(`Payment succeeded for checkout ${checkoutId}`);
      } else if (checkout.status === 'FAILED') {
        await this.updatePaymentStatus(checkoutId, 'failed');
        console.log(`Payment failed for checkout ${checkoutId}`);
      }

      return { received: true, processed: true };
    } catch (error) {
      console.error('Error processing SumUp webhook:', error);
      // Return success to prevent SumUp from retrying
      return { received: true, error: error.message };
    }
  }
}