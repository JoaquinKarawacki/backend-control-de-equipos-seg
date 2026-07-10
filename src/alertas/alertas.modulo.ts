import { Module } from '@nestjs/common';
import { AlertasControlador } from './alertas.controlador';
import { AlertasServicio } from './alertas.servicio';
import { AlertasProgramador } from './alertas.programador';
import { CorreoModulo } from '../correo/correo.modulo';

@Module({
  imports: [CorreoModulo],
  controllers: [AlertasControlador],
  providers: [AlertasServicio, AlertasProgramador],
  exports: [AlertasServicio],
})
export class AlertasModulo {}