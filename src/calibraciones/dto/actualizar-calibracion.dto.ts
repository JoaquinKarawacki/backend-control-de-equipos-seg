import { PartialType } from '@nestjs/mapped-types';
import { CrearCalibracionDto } from './crear-calibracion.dto';

export class ActualizarCalibracionDto extends PartialType(CrearCalibracionDto) {}