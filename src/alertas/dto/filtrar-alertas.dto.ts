import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { TipoAlerta } from '@prisma/client';

// Los query params siempre llegan como string ("true"/"false"). @Type(() => Boolean) NO sirve
// acá porque class-transformer hace `Boolean(value)`, y Boolean("false") da true en JS. Por eso
// se usa @Transform con la comparación explícita antes de @IsBoolean().
const aBooleano = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

export class FiltrarAlertasDto {
  @IsEnum(TipoAlerta) @IsOptional() tipo?: TipoAlerta;
  @IsString() @IsOptional() equipoId?: string;
  @Transform(aBooleano) @IsBoolean() @IsOptional() leida?: boolean;
  @Transform(aBooleano) @IsBoolean() @IsOptional() resuelta?: boolean;
}
