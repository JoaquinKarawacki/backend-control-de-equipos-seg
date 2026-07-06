import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../prisma/prisma.module';
import { EquipoModulo } from './equipos/equipos.modulo';
import { UsuarioModulo } from './usuarios/usuarios.modulo';
import { AuthModulo } from './auth/auth.modulo';
import { ReservaModulo } from './reservas/reservas.modulo';
import { CalibracionModulo } from './calibraciones/calibraciones.modulo';
import { MovimientosModulo } from './movimientos/movimientos.modulo';
import { AlertasModulo } from './alertas/alertas.modulo';
import { DocumentosModulo } from './documentos/documentos.modulo';

@Module({
  imports: [
   
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    PrismaModule,
    EquipoModulo,
    UsuarioModulo,
    AuthModulo,
    ReservaModulo,
    CalibracionModulo,
    MovimientosModulo,
    AlertasModulo,
    DocumentosModulo,
  ],
})
export class AppModule {}