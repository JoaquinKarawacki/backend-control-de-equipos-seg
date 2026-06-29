import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CrearCalibracionDto {
  @IsString()
  @IsNotEmpty()
  equipoId!: string;

  @IsString()
  @IsNotEmpty()
  registradaPorId!: string;

  @IsDateString()
  @IsNotEmpty()
  fechaRealizada!: string;

  // Opcional: si el equipo tiene intervaloCalibracionDias, el sistema la calcula.
  // Si no tiene intervalo, este campo es obligatorio (se valida en el servicio).
  @IsDateString()
  @IsOptional()
  fechaVencimiento?: string;

  @IsString()
  @IsOptional()
  laboratorio?: string;

  @IsString()
  @IsOptional()
  numeroCertificado?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}