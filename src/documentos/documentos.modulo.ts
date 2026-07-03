import { Module } from '@nestjs/common';
import { DocumentosControlador } from './documentos.controlador';
import { DocumentosServicio } from './documentos.servicio';
import { PrismaModule } from '../../prisma/prisma.module';
import { AlmacenamientoModulo } from '../almacenamiento/almacenamiento.modulo';

@Module({
  imports: [
    PrismaModule,          // para que DocumentosServicio pueda inyectar PrismaService
    AlmacenamientoModulo,  // trae el token ALMACENAMIENTO_PUERTO que el servicio inyecta
  ],
  controllers: [DocumentosControlador],
  providers: [DocumentosServicio],
})
export class DocumentosModulo {}