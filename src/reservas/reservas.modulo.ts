import { Module } from '@nestjs/common';
import { ReservaControlador } from './reservas.controlador';
import { ReservaServicio } from './reservas.servicio';

@Module({
  controllers: [ReservaControlador],
  providers: [ReservaServicio],
  exports: [ReservaServicio],
})
export class ReservaModulo {}