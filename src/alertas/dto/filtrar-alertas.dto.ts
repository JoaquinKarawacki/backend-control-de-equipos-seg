import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoAlerta } from '@prisma/client';

export class FiltrarAlertasDto {
  @IsEnum(TipoAlerta) @IsOptional() tipo?: TipoAlerta;
  @IsString() @IsOptional() equipoId?: string;
  @IsBoolean() @IsOptional() leida?: boolean;
  @IsBoolean() @IsOptional() resuelta?: boolean;
}
