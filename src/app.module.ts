import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { EquipoModulo } from './equipos/equipos.modulo';
import { UsuarioModulo } from './usuarios/usuarios.modulo';
import { AuthModulo } from './auth/auth.modulo';
import { ReservaModulo } from './reservas/reservas.modulo';
import { CalibracionModulo } from './calibraciones/calibraciones.modulo';

@Module({
  imports: [
    // ConfigModule global → process.env disponible en toda la app
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    EquipoModulo,
    UsuarioModulo,
    AuthModulo,
    ReservaModulo,
    CalibracionModulo,
  ],
})
export class AppModule {}