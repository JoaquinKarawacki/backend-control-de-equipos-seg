import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CrearReservaDto {
  @IsString()
  @IsNotEmpty()
  equipoId!: string;

  @IsString()
  @IsNotEmpty()
  tecnicoId!: string;

  @IsDateString()
  @IsNotEmpty()
  fechaDesde!: string;

  @IsDateString()
  @IsNotEmpty()
  fechaHasta!: string;

  @IsString()
  @IsOptional()
  proyecto?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}