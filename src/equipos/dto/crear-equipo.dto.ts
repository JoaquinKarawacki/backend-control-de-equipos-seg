import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
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

  // Las fechas viajan como string ISO desde el cliente (ej: "2025-03-15")
  // y las convertimos a Date en el service
  @IsDateString()
  @IsOptional()
  fechaUltimaCalibracion?: string;

  @IsDateString()
  @IsOptional()
  vencimientoCalibracion?: string;
}