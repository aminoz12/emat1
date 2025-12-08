import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabase: any;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get('SUPABASE_URL');
    // Use service role key (already configured) or anon key for token verification
    const supabaseKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY') ||
                        this.configService.get('SUPABASE_ANON_KEY') ||
                        this.configService.get('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ Supabase credentials not configured for auth guard');
      console.warn('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!this.supabase) {
      // If Supabase not configured, log error but allow for development
      console.error('⚠️ Supabase auth guard not configured - check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
      console.warn('⚠️ Allowing request without authentication (development mode)');
      // For production, you might want to throw an error here instead
      return true;
    }

    try {
      // Verify the token using Supabase
      // Try getUser with token parameter first (works with service role key)
      let user, error;
      
      try {
        const result = await this.supabase.auth.getUser(token);
        user = result.data.user;
        error = result.error;
      } catch (e) {
        // If that fails, try creating a client with anon key and token in headers
        const supabaseUrl = this.configService.get('SUPABASE_URL');
        const anonKey = this.configService.get('SUPABASE_ANON_KEY') || 
                        this.configService.get('NEXT_PUBLIC_SUPABASE_ANON_KEY');
        
        if (anonKey) {
          const clientWithToken = createClient(supabaseUrl, anonKey, {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          });
          
          const result = await clientWithToken.auth.getUser();
          user = result.data.user;
          error = result.error;
        } else {
          error = e;
        }
      }

      if (error) {
        console.error('Supabase token verification error:', error);
        throw new UnauthorizedException(`Invalid or expired token: ${error.message}`);
      }

      if (!user) {
        console.error('No user found for token');
        throw new UnauthorizedException('User not found');
      }

      // Attach user to request
      request.user = {
        id: user.id,
        email: user.email,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Unexpected error in SupabaseAuthGuard:', error);
      throw new UnauthorizedException(`Token verification failed: ${error.message || 'Unknown error'}`);
    }
  }
}

