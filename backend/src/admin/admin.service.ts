import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { ServicesService } from '../services/services.service';

@Injectable()
export class AdminService {
  constructor(
    private supabase: SupabaseService,
    private ordersService: OrdersService,
    private usersService: UsersService,
    private servicesService: ServicesService,
  ) {}

  async getDashboardStats() {
    const supabase = this.supabase.getClient();
    
    const [
      { count: totalUsers },
      { count: totalOrders },
      { data: paidOrders },
      { count: pendingOrders },
      { count: completedOrders },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('price').eq('payment_status', 'paid'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    ]);

    const totalRevenue = paidOrders?.reduce((sum, order) => sum + (order.price || 0), 0) || 0;

    return {
      totalUsers: totalUsers || 0,
      totalOrders: totalOrders || 0,
      totalRevenue,
      pendingOrders: pendingOrders || 0,
      completedOrders: completedOrders || 0,
    };
  }

  async getRecentOrders(limit = 10) {
    const supabase = this.supabase.getClient();
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:users(id, name, email),
        vehicle:vehicles(make, model, year),
        service:services(name, type)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch recent orders: ${error.message}`);
    }

    return data || [];
  }

  async getUsers(limit = 50, offset = 0) {
    const supabase = this.supabase.getClient();
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        role,
        created_at,
        orders:orders(count)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    // Get order counts separately since Supabase doesn't support _count
    const usersWithCounts = await Promise.all(
      (data || []).map(async (user) => {
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        return {
          ...user,
          createdAt: user.created_at,
          _count: { orders: count || 0 },
        };
      })
    );

    return usersWithCounts;
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.ordersService.updateStatus(orderId, status as any);
  }

  async updateServicePricing(pricingData: any[]) {
    return this.servicesService.updatePricing(pricingData);
  }

  async getEmailLogs(limit = 50, offset = 0) {
    const supabase = this.supabase.getClient();
    
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch email logs: ${error.message}`);
    }

    return (data || []).map(log => ({
      ...log,
      createdAt: log.created_at,
      sentAt: log.sent_at,
    }));
  }
}
