import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { TipoMovimiento } from '@prisma/client';

export class RegistrarMovimientoDto {
  @IsEnum(TipoMovimiento) @IsNotEmpty() tipo!: TipoMovimiento;
  @IsString() @IsNotEmpty() equipoId!: string;
  @IsString() @IsNotEmpty() tecnicoId!: string;
  @IsString() @IsOptional() reservaId?: string;
  @IsString() @IsOptional() proyectoAsociado?: string;
  @IsString() @IsOptional() observaciones?: string;
  // Solo se usa (y se exige) en un RETIRO sin reservaId — ver RetiroEstrategia.
  @IsDateString() @IsOptional() fechaDevolucionEsperada?: string;
}