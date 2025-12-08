import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DocumentType } from './dto/create-document.dto';
import { Express } from 'express';
import 'multer';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDocumentDto: CreateDocumentDto) {
    return this.prisma.document.create({
      data: createDocumentDto,
    });
  }

  async findByOrderId(orderId: string) {
    return this.prisma.document.findMany({
      where: { orderId },
    });
  }

  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async remove(id: string) {
    const document = await this.findOne(id);
    
    return this.prisma.document.delete({
      where: { id },
    });
  }

  async uploadDocument(
    orderId: string,
    file: Express.Multer.File,
    documentType: DocumentType,
  ) {
    // In a real implementation, you would upload to S3 or similar
    const fileUrl = `https://your-bucket.s3.amazonaws.com/${file.filename}`;
    
    return this.create({
      orderId,
      fileName: file.originalname,
      fileUrl,
      fileType: file.mimetype,
      fileSize: file.size,
      documentType,
    });
  }
}
