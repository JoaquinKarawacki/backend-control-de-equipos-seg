import { Module } from '@nestjs/common';
import { CorreoServicio } from './correo.servicio';

@Module({
  providers: [CorreoServicio],
  exports: [CorreoServicio],
})
export class CorreoModulo {}
