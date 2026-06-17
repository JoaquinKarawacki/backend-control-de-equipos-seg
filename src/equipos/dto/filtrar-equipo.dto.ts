import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoEquipo, CriticidadEquipo } from '@prisma/client';

// Este DTO se usa para los query params del GET /api/equipos
// Ejemplo: GET /api/equipos?estado=DISPONIBLE&busqueda=flir
export class FiltrarEquiposDto {
  @IsEnum(EstadoEquipo)
  @IsOptional()
  estado?: EstadoEquipo;

  @IsEnum(CriticidadEquipo)
  @IsOptional()
  criticidad?: CriticidadEquipo;

  @IsString()
  @IsOptional()
  busqueda?: string;
}