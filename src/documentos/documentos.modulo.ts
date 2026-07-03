import { Module } from '@nestjs/common';
import { DocumentosControlador } from './documentos.controlador';
import { DocumentosServicio } from './documentos.servicio';
import { PrismaModule } from '../../prisma/prisma.module';
import { AlmacenamientoModulo } from '../almacenamiento/almacenamiento.modulo';
import { AuditoriaModulo } from '../auditoria/auditoria.modulo';

@Module({
  imports: [
    PrismaModule,          
    AlmacenamientoModulo,
    AuditoriaModulo 
  ],
  controllers: [DocumentosControlador],
  providers: [DocumentosServicio],
})
export class DocumentosModulo {}