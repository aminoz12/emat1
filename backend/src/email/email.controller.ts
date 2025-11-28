import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Email')
@Controller('email')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-order-confirmation')
  @ApiOperation({ summary: 'Send order confirmation email' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  async sendOrderConfirmation(
    @Body('orderId') orderId: string,
    @Body('userEmail') userEmail: string,
  ) {
    return this.emailService.sendOrderConfirmation(orderId, userEmail);
  }

  @Post('send-status-update')
  @ApiOperation({ summary: 'Send order status update email' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  async sendOrderStatusUpdate(
    @Body('orderId') orderId: string,
    @Body('status') status: string,
  ) {
    return this.emailService.sendOrderStatusUpdate(orderId, status);
  }

  @Post('send-invoice')
  @ApiOperation({ summary: 'Send invoice email' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  async sendInvoice(
    @Body('orderId') orderId: string,
    @Body('invoiceUrl') invoiceUrl: string,
  ) {
    return this.emailService.sendInvoice(orderId, invoiceUrl);
  }
}
