import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { TipoMovimiento } from '@prisma/client';

export class RegistrarMovimientoDto {
  @IsEnum(TipoMovimiento) @IsNotEmpty() tipo!: TipoMovimiento;
  @IsString() @IsNotEmpty() equipoId!: string;
  @IsString() @IsNotEmpty() tecnicoId!: string;
  @IsString() @IsOptional() reservaId?: string;
  @IsString() @IsOptional() proyectoAsociado?: string;
  @IsString() @IsOptional() observaciones?: string;
}