import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private supabase: SupabaseService) {}

  async create(createServiceDto: CreateServiceDto) {
    const supabase = this.supabase.getClient();
    
    const { data, error } = await supabase
      .from('services')
      .insert(createServiceDto)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create service: ${error.message}`);
    }

    return data;
  }

  async findAll() {
    const supabase = this.supabase.getClient();
    
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to fetch services: ${error.message}`);
    }

    return data || [];
  }

  async findOne(id: string) {
    const supabase = this.supabase.getClient();
    
    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    await this.findOne(id); // Verify service exists
    
    const supabase = this.supabase.getClient();
    
    const { data, error } = await supabase
      .from('services')
      .update(updateServiceDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update service: ${error.message}`);
    }

    return data;
  }

  async remove(id: string) {
    await this.findOne(id); // Verify service exists
    
    const supabase = this.supabase.getClient();
    
    const { data, error } = await supabase
      .from('services')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to deactivate service: ${error.message}`);
    }

    return data;
  }

  async getPricing() {
    const supabase = this.supabase.getClient();
    
    const { data, error } = await supabase
      .from('pricing')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to fetch pricing: ${error.message}`);
    }

    return data || [];
  }

  async updatePricing(pricingData: any[]) {
    const supabase = this.supabase.getClient();
    
    // Clear existing pricing
    await supabase.from('pricing').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Create new pricing
    const { data, error } = await supabase
      .from('pricing')
      .insert(pricingData)
      .select();

    if (error) {
      throw new Error(`Failed to update pricing: ${error.message}`);
    }

    return data;
  }
}
