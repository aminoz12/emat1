import { IsString, IsInt, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DocumentType {
  CHANGEMENT_TITULAIRE = 'changement-titulaire',
  DUPLICATA = 'duplicata',
  IMMATRICULATION_PROVISOIRE_WW = 'immatriculation-provisoire-ww',
  ENREGISTREMENT_CESSION = 'enregistrement-cession',
  CHANGEMENT_ADRESSE = 'changement-adresse',
  FICHE_IDENTIFICATION = 'fiche-identification',
  DECLARATION_ACHAT = 'declaration-achat',
  W_GARAGE = 'w-garage'
}

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
