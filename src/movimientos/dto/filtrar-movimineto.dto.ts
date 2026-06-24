import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoMovimiento } from '@prisma/client';

export class FiltrarMovimientosDto {
  @IsString() @IsOptional() equipoId?: string;
  @IsString() @IsOptional() tecnicoId?: string;
  @IsEnum(TipoMovimiento) @IsOptional() tipo?: TipoMovimiento;
}