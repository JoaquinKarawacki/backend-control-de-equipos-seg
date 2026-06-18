import { Module } from '@nestjs/common';
import { CalibracionControlador } from './calibraciones.controlador';
import { CalibracionServicio } from './calibraciones.servicio';

@Module({
  controllers: [CalibracionControlador],
  providers: [CalibracionServicio],
  exports: [CalibracionServicio],
})
export class CalibracionModulo {}