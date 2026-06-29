import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { CriticidadEquipo } from '@prisma/client';

export class CrearEquipoDto {
  @IsString()
  @IsNotEmpty()
  codigoInterno!: string;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @IsString()
  @IsNotEmpty()
  marca!: string;

  @IsString()
  @IsNotEmpty()
  modelo!: string;

  @IsString()
  @IsOptional()
  numeroDeSerie?: string;

  @IsString()
  @IsOptional()
  ubicacion?: string;

  @IsEnum(CriticidadEquipo)
  @IsOptional()
  criticidad?: CriticidadEquipo;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsBoolean()
  @IsOptional()
  requiereCalibracion?: boolean;

  @IsInt()
  @Min(1)
  @IsOptional()
  intervaloCalibracionDias?: number;

  @IsDateString()
  @IsOptional()
  fechaUltimaCalibracion?: string;

  @IsDateString()
  @IsOptional()
  vencimientoCalibracion?: string;
}