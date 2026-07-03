import { Module } from '@nestjs/common';
import { AuditoriaServicio } from './auditoria.servicio';
import { AuditoriaControlador } from './auditoria.controlador';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuditoriaControlador],
  providers: [AuditoriaServicio],
  // EXPORTA el servicio: los demás módulos (equipos, reservas, etc.)
  // lo van a inyectar para registrar sus acciones.
  exports: [AuditoriaServicio],
})
export class AuditoriaModulo {}