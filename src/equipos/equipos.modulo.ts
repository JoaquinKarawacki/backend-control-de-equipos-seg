import { Module } from '@nestjs/common';
import { EquipoControlador } from './equipos.controlador';
import { EquipoServicio } from './equipos.servicio';

@Module({
  controllers: [EquipoControlador],
  providers: [EquipoServicio],
  exports: [EquipoServicio],
})
export class EquipoModulo {}