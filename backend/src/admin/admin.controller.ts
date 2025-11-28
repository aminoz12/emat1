import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  getDashboardStats(@Request() req) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      throw new Error('Access denied');
    }
    return this.adminService.getDashboardStats();
  }

  @Get('recent-orders')
  @ApiOperation({ summary: 'Get recent orders' })
  @ApiResponse({ status: 200, description: 'Recent orders' })
  getRecentOrders(@Request() req) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      throw new Error('Access denied');
    }
    return this.adminService.getRecentOrders();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  getUsers(@Request() req) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      throw new Error('Access denied');
    }
    return this.adminService.getUsers();
  }

  @Post('orders/:id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req,
  ) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      throw new Error('Access denied');
    }
    return this.adminService.updateOrderStatus(id, status);
  }

  @Post('pricing')
  @ApiOperation({ summary: 'Update service pricing' })
  @ApiResponse({ status: 200, description: 'Pricing updated' })
  updatePricing(@Body() pricingData: any[], @Request() req) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      throw new Error('Access denied');
    }
    return this.adminService.updateServicePricing(pricingData);
  }

  @Get('email-logs')
  @ApiOperation({ summary: 'Get email logs' })
  @ApiResponse({ status: 200, description: 'Email logs' })
  getEmailLogs(@Request() req) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      throw new Error('Access denied');
    }
    return this.adminService.getEmailLogs();
  }
}
