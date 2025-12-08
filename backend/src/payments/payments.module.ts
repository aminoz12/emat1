import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { SumUpService } from './sumup.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

@Module({
  providers: [PaymentsService, SumUpService, SupabaseAuthGuard],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
