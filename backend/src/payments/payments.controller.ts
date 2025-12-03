import { Controller, Post, Body, Headers, RawBody, UseGuards, Request, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment intent' })
  @ApiResponse({ status: 200, description: 'Payment intent created' })
  async createPaymentIntent(
    @Body('orderId') orderId: string,
    @Body('amount') amount: number,
    @Body('currency') currency: string,
    @Body('provider') provider: 'stripe' | 'sumup' = 'stripe',
  ) {
    return this.paymentsService.createPaymentIntent(orderId, amount, currency, provider);
  }

  @Post('confirm-payment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm payment' })
  @ApiResponse({ status: 200, description: 'Payment confirmed' })
  async confirmPayment(@Body('paymentIntentId') paymentIntentId: string) {
    return this.paymentsService.confirmPayment(paymentIntentId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Payment webhook handler' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(
    @RawBody() payload: Buffer,
    @Headers('stripe-signature') signature: string,
    @Headers('sumup-signature') sumupSignature: string,
    @Query('provider') provider: 'stripe' | 'sumup' = 'stripe',
  ) {
    if (provider === 'sumup') {
      return this.paymentsService.handleWebhook(payload.toString(), '', 'sumup');
    }
    
    return this.paymentsService.handleWebhook(payload.toString(), signature, 'stripe');
  }

  @Post('webhook/sumup')
  @ApiOperation({ summary: 'SumUp webhook handler' })
  @ApiResponse({ status: 200, description: 'SumUp webhook processed' })
  async handleSumUpWebhook(
    @Req() req: Request,
    @RawBody() payload: Buffer,
    @Headers('sumup-signature') sumupSignature: string,
  ) {
    // Forward to the payments service
    return this.paymentsService.handleWebhook(payload.toString(), '', 'sumup');
  }
}