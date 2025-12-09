import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

enum EmailStatus {
  SENT = 'sent',
  FAILED = 'failed'
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private supabase: SupabaseService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: `${this.configService.get('FROM_NAME')} <${this.configService.get('FROM_EMAIL')}>`,
        to,
        subject,
        html,
      });

      await this.logEmail(to, subject, EmailStatus.SENT);
      return { success: true };
    } catch (error) {
      await this.logEmail(to, subject, EmailStatus.FAILED, error.message);
      throw error;
    }
  }

  async sendOrderConfirmation(orderId: string, userEmail: string) {
    const supabase = this.supabase.getClient();
    
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:users(*),
        vehicle:vehicles(*),
        service:services(*)
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      throw new Error('Order not found');
    }

    const template = await this.getEmailTemplate('order-confirmation');
    const compiledTemplate = handlebars.compile(template);
    
    const html = compiledTemplate({
      userName: order.user?.name,
      orderNumber: order.id,
      serviceName: order.service?.name,
      totalPrice: order.price || order.total_price,
      vehicleInfo: `${order.vehicle?.make} ${order.vehicle?.model} (${order.vehicle?.year})`,
    });

    return this.sendEmail(
      userEmail,
      'Confirmation de commande - EMatricule',
      html,
    );
  }

  async sendOrderStatusUpdate(orderId: string, status: string) {
    const supabase = this.supabase.getClient();
    
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:users(*),
        service:services(*)
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      throw new Error('Order not found');
    }

    const template = await this.getEmailTemplate('order-status-update');
    const compiledTemplate = handlebars.compile(template);
    
    const html = compiledTemplate({
      userName: order.user?.name,
      orderNumber: order.id,
      serviceName: order.service?.name,
      status,
    });

    return this.sendEmail(
      order.user?.email,
      `Mise à jour de votre commande - EMatricule`,
      html,
    );
  }

  async sendInvoice(orderId: string, invoiceUrl: string) {
    const supabase = this.supabase.getClient();
    
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:users(*),
        service:services(*)
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      throw new Error('Order not found');
    }

    const template = await this.getEmailTemplate('invoice');
    const compiledTemplate = handlebars.compile(template);
    
    const html = compiledTemplate({
      userName: order.user?.name,
      orderNumber: order.id,
      serviceName: order.service?.name,
      totalPrice: order.price || order.total_price,
      invoiceUrl,
    });

    return this.sendEmail(
      order.user?.email,
      'Votre facture - EMatricule',
      html,
    );
  }

  private async getEmailTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(process.cwd(), 'templates', `${templateName}.hbs`);
    return fs.promises.readFile(templatePath, 'utf-8');
  }

  private async logEmail(to: string, subject: string, status: EmailStatus, error?: string) {
    const supabase = this.supabase.getClient();
    
    const { data, error: dbError } = await supabase
      .from('email_logs')
      .insert({
        to,
        subject,
        status,
        error,
        sent_at: status === EmailStatus.SENT ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Failed to log email:', dbError);
    }

    return data;
  }
}
