import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TipoDocumento } from '@prisma/client';

export class SubirDocumentoDto {

  @IsString()
  @IsNotEmpty()
  equipoId!: string;

  @IsEnum(TipoDocumento)
  tipo!: TipoDocumento;
 
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  calibracionId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;
}