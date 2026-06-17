import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { EquipoModulo } from './equipos/equipos.modulo';
import { UsuarioModulo } from './usuarios/usuarios.modulo';

@Module({
  imports: [
    // ConfigModule global → process.env disponible en toda la app
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    EquipoModulo,
    UsuarioModulo,
  ],
})
export class AppModule {}