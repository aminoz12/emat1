import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import axios from 'axios';

@Injectable()
export class VehiclesService {
  constructor(
    private supabase: SupabaseService,
    private configService: ConfigService,
  ) {}

  async decodeVin(vin: string) {
    // Check cache first
    const cached = await this.getCachedVinData(vin);
    if (cached) {
      return cached;
    }

    // Decode VIN using external API
    const decodedData = await this.callVinDecoderApi(vin);
    
    // Cache the result
    await this.cacheVinData(vin, decodedData);
    
    return decodedData;
  }

  private async getCachedVinData(vin: string) {
    // In a real implementation, you would use Redis here
    // For now, we'll check the database
    const supabase = this.supabase.getClient();
    
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .eq('vin', vin)
      .single();
    
    return data || null;
  }

  private async cacheVinData(vin: string, data: any) {
    // Store in database for caching
    const supabase = this.supabase.getClient();
    
    // Check if vehicle exists
    const { data: existing } = await supabase
      .from('vehicles')
      .select('id')
      .eq('vin', vin)
      .single();

    const vehicleData = {
      vin,
      make: data.make,
      model: data.model,
      year: data.year,
      engine: data.engine,
      fuel_type: data.fuelType,
      color: data.color,
      body_type: data.bodyType,
      weight: data.weight,
      power: data.power,
      displacement: data.displacement,
    };

    if (existing) {
      const { data: updated, error } = await supabase
        .from('vehicles')
        .update(vehicleData)
        .eq('vin', vin)
        .select()
        .single();
      
      if (error) throw new Error(`Failed to update vehicle: ${error.message}`);
      return updated;
    } else {
      const { data: created, error } = await supabase
        .from('vehicles')
        .insert(vehicleData)
        .select()
        .single();
      
      if (error) throw new Error(`Failed to create vehicle: ${error.message}`);
      return created;
    }
  }

  private async callVinDecoderApi(vin: string) {
    const apiKey = this.configService.get('VIN_DECODER_API_KEY');
    const baseUrl = this.configService.get('VIN_DECODER_BASE_URL');
    
    try {
      const response = await axios.get(`${baseUrl}/decode`, {
        params: { vin },
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      
      return this.transformVinData(response.data);
    } catch (error) {
      throw new NotFoundException('Unable to decode VIN');
    }
  }

  private transformVinData(apiData: any) {
    return {
      make: apiData.make || 'Unknown',
      model: apiData.model || 'Unknown',
      year: apiData.year || new Date().getFullYear(),
      engine: apiData.engine || null,
      fuelType: apiData.fuel_type || null,
      color: apiData.color || null,
      bodyType: apiData.body_type || null,
      weight: apiData.weight || null,
      power: apiData.power || null,
      displacement: apiData.displacement || null,
    };
  }

  async create(createVehicleDto: CreateVehicleDto) {
    const supabase = this.supabase.getClient();
    
    const { data, error } = await supabase
      .from('vehicles')
      .insert(createVehicleDto)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create vehicle: ${error.message}`);
    }

    return data;
  }

  async findAll() {
    const supabase = this.supabase.getClient();
    
    const { data, error } = await supabase
      .from('vehicles')
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch vehicles: ${error.message}`);
    }

    return data || [];
  }

  async findOne(id: string) {
    const supabase = this.supabase.getClient();
    
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async findByVin(vin: string) {
    const supabase = this.supabase.getClient();
    
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('vin', vin)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw new Error(`Failed to find vehicle: ${error.message}`);
    }

    return data || null;
  }
}
