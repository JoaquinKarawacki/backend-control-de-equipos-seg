import { Module } from '@nestjs/common';
import { UsuarioControlador } from './usuarios.controlador';
import { UsuarioServicio } from './usuarios.servicio';
import { AuditoriaModulo } from '../auditoria/auditoria.modulo';

@Module({
  imports: [AuditoriaModulo],
  controllers: [UsuarioControlador],
  providers: [UsuarioServicio],
  exports: [UsuarioServicio],
})
export class UsuarioModulo {}