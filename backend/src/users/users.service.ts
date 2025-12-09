import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private supabase: SupabaseService) {}

  async create(createUserDto: CreateUserDto) {
    const supabase = this.supabase.getClient();
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', createUserDto.email)
      .single();

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const { data, error } = await supabase
      .from('users')
      .insert(createUserDto)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  }

  async findAll() {
    const supabase = this.supabase.getClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, phone, address, city, zip_code, country, created_at, updated_at');

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    // Map zip_code to zipCode for consistency
    return (data || []).map(user => ({
      ...user,
      zipCode: user.zip_code,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }));
  }

  async findOne(id: string) {
    const supabase = this.supabase.getClient();
    
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        role,
        phone,
        address,
        city,
        zip_code,
        country,
        created_at,
        updated_at,
        orders:orders(
          *,
          vehicle:vehicles(*),
          service:services(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      zipCode: user.zip_code,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async findByEmail(email: string) {
    const supabase = this.supabase.getClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw new Error(`Failed to find user: ${error.message}`);
    }

    return data || null;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // Verify user exists
    
    const supabase = this.supabase.getClient();
    
    const { data, error } = await supabase
      .from('users')
      .update(updateUserDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  }

  async remove(id: string) {
    await this.findOne(id); // Verify user exists
    
    const supabase = this.supabase.getClient();
    
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    return data;
  }
}
