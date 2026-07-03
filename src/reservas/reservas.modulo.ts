import { Module } from '@nestjs/common';
import { ReservaControlador } from './reservas.controlador';
import { ReservaServicio } from './reservas.servicio';
import { AuditoriaModulo } from '../auditoria/auditoria.modulo';

@Module({
  imports: [AuditoriaModulo],
  controllers: [ReservaControlador],
  providers: [ReservaServicio],
  exports: [ReservaServicio],
})
export class ReservaModulo {}