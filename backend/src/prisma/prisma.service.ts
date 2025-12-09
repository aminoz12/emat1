import { Injectable, OnModuleInit, Optional } from '@nestjs/common';

@Injectable()
export class PrismaService implements OnModuleInit {
  constructor() {
    // Prisma is not used - backend uses Supabase directly
    // This service exists for compatibility but doesn't initialize Prisma
  }
  
  async onModuleInit() {
    // No-op: Prisma not used, Supabase is used instead
  }
}
