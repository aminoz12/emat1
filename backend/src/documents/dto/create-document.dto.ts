import { IsString, IsInt, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';

export class CreateDocumentDto {
  @ApiProperty({ example: 'clh123456789' })
  @IsString()
  orderId: string;

  @ApiProperty({ example: 'identity_card.pdf' })
  @IsString()
  fileName: string;

  @ApiProperty({ example: 'https://example.com/file.pdf' })
  @IsString()
  fileUrl: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  fileType: string;

  @ApiProperty({ example: 1024000 })
  @IsInt()
  fileSize: number;

  @ApiProperty({ example: 'IDENTITY_CARD', enum: DocumentType })
  @IsEnum(DocumentType)
  documentType: DocumentType;
}
