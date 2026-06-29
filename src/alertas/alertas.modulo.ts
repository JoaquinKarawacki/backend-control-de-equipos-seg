import { Module } from '@nestjs/common';
import { AlertasControlador } from './alertas.controlador';
import { AlertasServicio } from './alertas.servicio';
import { AlertasProgramador } from './alertas.programador';

@Module({
  controllers: [AlertasControlador],
  providers: [AlertasServicio, AlertasProgramador],
  exports: [AlertasServicio],
})
export class AlertasModulo {}