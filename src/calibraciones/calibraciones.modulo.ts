import { Module } from '@nestjs/common';
import { CalibracionControlador } from './calibraciones.controlador';
import { CalibracionServicio } from './calibraciones.servicio';
import { AuditoriaModulo } from '../auditoria/auditoria.modulo';

@Module({
  imports: [AuditoriaModulo],
  controllers: [CalibracionControlador],
  providers: [CalibracionServicio],
  exports: [CalibracionServicio],
})
export class CalibracionModulo {}