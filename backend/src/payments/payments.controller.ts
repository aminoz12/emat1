import { Controller, Post, Body, Headers, RawBody, UseGuards, Req } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Create SumUp checkout' })
  @ApiResponse({ status: 200, description: 'Checkout created' })
  async createPaymentIntent(
    @Body('orderId') orderId: string,
    @Body('amount') amount: number,
    @Body('currency') currency: string,
  ) {
    return this.paymentsService.createPaymentIntent(orderId, amount, currency);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'SumUp webhook handler' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(
    @RawBody() payload: Buffer,
    @Headers('sumup-signature') sumupSignature: string,
  ) {
    return this.paymentsService.handleWebhook(payload.toString());
  }
}