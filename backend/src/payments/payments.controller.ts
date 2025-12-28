import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Fixed: Correct path to JWT guard
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create SumUp checkout' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns checkout URL and ID for the payment widget' 
  })
  async createCheckout(
    @Body('orderId') orderId: string,
    @Body('amount') amount: number,
    @Body('currency') currency: string = 'eur',
  ) {
    return await this.paymentsService.createPaymentIntent(orderId, amount, currency);
  }

  @Post('create-payment-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create SumUp payment intent' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns checkout URL and ID for the payment widget' 
  })
  async createPaymentIntent(
    @Body('orderId') orderId: string,
    @Body('amount') amount: number,
    @Body('currency') currency: string = 'eur',
  ) {
    return this.paymentsService.createPaymentIntent(orderId, amount, currency);
  }

  @Get('verify-payment/:checkoutId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify payment status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the current payment status' 
  })
  async verifyPayment(
    @Param('checkoutId') checkoutId: string
  ) {
    return this.paymentsService.verifyPayment(checkoutId);
  }
}