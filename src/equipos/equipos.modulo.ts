import { Module } from '@nestjs/common';
import { EquipoControlador } from './equipos.controlador';
import { EquipoServicio } from './equipos.servicio';
import { AuditoriaModulo } from '../auditoria/auditoria.modulo';

@Module({
  imports: [AuditoriaModulo],
  controllers: [EquipoControlador],
  providers: [EquipoServicio],
  exports: [EquipoServicio],
})
export class EquipoModulo {}