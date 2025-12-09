import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DocumentType } from './dto/create-document.dto';
import { Express } from 'express';
import 'multer';

@Injectable()
export class DocumentsService {
  constructor(private supabase: SupabaseService) {}

  async create(createDocumentDto: CreateDocumentDto) {
    const supabase = this.supabase.getClient();
    
    // Map DTO fields (camelCase) to database fields (snake_case)
    const documentData = {
      order_id: createDocumentDto.orderId,
      file_name: createDocumentDto.fileName,
      file_url: createDocumentDto.fileUrl,
      file_type: createDocumentDto.fileType,
      file_size: createDocumentDto.fileSize,
      document_type: createDocumentDto.documentType,
    };
    
    const { data, error } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create document: ${error.message}`);
    }

    return data;
  }

  async findByOrderId(orderId: string) {
    const supabase = this.supabase.getClient();
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('order_id', orderId);

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    return data || [];
  }

  async findOne(id: string) {
    const supabase = this.supabase.getClient();
    
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async remove(id: string) {
    await this.findOne(id); // Verify document exists
    
    const supabase = this.supabase.getClient();
    
    const { data, error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }

    return data;
  }

  async uploadDocument(
    orderId: string,
    file: Express.Multer.File,
    documentType: DocumentType,
  ) {
    // In a real implementation, you would upload to S3 or similar
    const fileUrl = `https://your-bucket.s3.amazonaws.com/${file.filename}`;
    
    return this.create({
      orderId: orderId,
      fileName: file.originalname,
      fileUrl: fileUrl,
      fileType: file.mimetype,
      fileSize: file.size,
      documentType: documentType,
    });
  }
}
