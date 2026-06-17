import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { EquiposModule } from './equipos/equipos.modulo';
@Module({
  imports: [
    // ConfigModule global → process.env disponible en toda la app
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    EquiposModule,
  ],
})
export class AppModule {}