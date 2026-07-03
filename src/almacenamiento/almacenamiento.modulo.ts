import { Module } from '@nestjs/common';
import { ALMACENAMIENTO_PUERTO } from './almacenamiento.puerto';
import { AlmacenamientoLocalServicio } from './almacenamiento-local.servicio';

@Module({
  providers: [
    {
      // El token que vive en runtime (la constante que exportamos del puerto).
      provide: ALMACENAMIENTO_PUERTO,
      // La implementación concreta que NestJS entrega cuando alguien pide ese token.
      useClass: AlmacenamientoLocalServicio,
    },
  ],
  // Exporto el TOKEN, no la clase. Así otros módulos (DocumentosModulo)
  // pueden inyectar el puerto sin conocer la implementación concreta.
  exports: [ALMACENAMIENTO_PUERTO],
})
export class AlmacenamientoModulo {}