import { PartialType } from '@nestjs/mapped-types';
import { CrearEquipoDto } from './crear-equipo.dto';

// PartialType toma todos los campos de CrearEquipoDto y los hace opcionales
// Así no repetimos las validaciones — principio DRY
export class ActualizarEquipoDto extends PartialType(CrearEquipoDto) {}