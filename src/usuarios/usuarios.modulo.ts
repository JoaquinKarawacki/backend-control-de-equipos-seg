import { Module } from '@nestjs/common';
import { UsuarioControlador } from './usuarios.controlador';
import { UsuarioServicio } from './usuarios.servicio';

@Module({
  controllers: [UsuarioControlador],
  providers: [UsuarioServicio],
  exports: [UsuarioServicio],
})
export class UsuarioModulo {}