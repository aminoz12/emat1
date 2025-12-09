import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

@Injectable()
export class OrdersService {
  constructor(private supabase: SupabaseService) {}

  async create(createOrderDto: CreateOrderDto, userId: string) {
    const supabase = this.supabase.getClient();
    
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        ...createOrderDto,
        user_id: userId,
        status: OrderStatus.PENDING,
        payment_status: PaymentStatus.PENDING,
      })
      .select(`
        *,
        user:users(*),
        vehicle:vehicles(*),
        service:services(*),
        documents:documents(*)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }

    return order;
  }

  async findAll(userId?: string, userRole?: string) {
    const supabase = this.supabase.getClient();
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        user:users(*),
        vehicle:vehicles(*),
        service:services(*),
        documents:documents(*)
      `)
      .order('created_at', { ascending: false });

    if (userRole !== 'ADMIN' && userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return data || [];
  }

  async findOne(id: string, userId?: string, userRole?: string) {
    const supabase = this.supabase.getClient();
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        user:users(*),
        vehicle:vehicles(*),
        service:services(*),
        documents:documents(*)
      `)
      .eq('id', id)
      .single();

    const { data: order, error } = await query;

    if (error || !order) {
      throw new NotFoundException('Order not found');
    }

    // Check authorization
    if (userRole !== 'ADMIN' && order.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto, userId?: string, userRole?: string) {
    await this.findOne(id, userId, userRole); // Verify access
    
    const supabase = this.supabase.getClient();
    
    const { data, error } = await supabase
      .from('orders')
      .update(updateOrderDto)
      .eq('id', id)
      .select(`
        *,
        user:users(*),
        vehicle:vehicles(*),
        service:services(*),
        documents:documents(*)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update order: ${error.message}`);
    }

    return data;
  }

  async updateStatus(id: string, status: OrderStatus, userId?: string, userRole?: string) {
    await this.findOne(id, userId, userRole); // Verify access
    
    const supabase = this.supabase.getClient();
    
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        user:users(*),
        vehicle:vehicles(*),
        service:services(*),
        documents:documents(*)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }

    return data;
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus, stripePaymentId?: string) {
    const supabase = this.supabase.getClient();
    
    const updateData: any = { payment_status: paymentStatus };
    if (stripePaymentId) {
      updateData.stripe_payment_id = stripePaymentId;
    }
    
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        user:users(*),
        vehicle:vehicles(*),
        service:services(*),
        documents:documents(*)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update payment status: ${error.message}`);
    }

    return data;
  }

  async remove(id: string, userId?: string, userRole?: string) {
    await this.findOne(id, userId, userRole); // Verify access
    
    const supabase = this.supabase.getClient();
    
    const { data, error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to delete order: ${error.message}`);
    }

    return data;
  }

  async getOrderStats() {
    const supabase = this.supabase.getClient();
    
    // Get counts
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', OrderStatus.PENDING);

    const { count: completedOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', OrderStatus.COMPLETED);

    // Get total revenue
    const { data: paidOrders } = await supabase
      .from('orders')
      .select('price')
      .eq('payment_status', PaymentStatus.PAID);

    const totalRevenue = paidOrders?.reduce((sum, order) => sum + (order.price || 0), 0) || 0;

    return {
      totalOrders: totalOrders || 0,
      pendingOrders: pendingOrders || 0,
      completedOrders: completedOrders || 0,
      totalRevenue,
    };
  }
}
