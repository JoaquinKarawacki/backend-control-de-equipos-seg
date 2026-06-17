import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EstadoEquipo } from '@prisma/client';

export class CambiarEstadoDto {
  @IsEnum(EstadoEquipo)
  @IsNotEmpty()
  estado!: EstadoEquipo;

  @IsString()
  @IsOptional()
  observaciones?: string;
}