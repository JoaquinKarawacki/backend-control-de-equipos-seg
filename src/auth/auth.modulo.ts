import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { AuthControlador } from './auth.controlador';
import { AuthServicio } from './auth.servicio';
import { JwtEstrategia } from './jwt.estrategia';
import { JwtGuardia } from './jwt.guardia';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
    useFactory: () => ({
        secret: process.env.JWT_SECRET!,
        signOptions: { expiresIn: (process.env.JWT_EXPIRA_EN ?? '7d') as any },
        }),
    }),
  ],
  controllers: [AuthControlador],
  providers: [AuthServicio, JwtEstrategia, JwtGuardia],
  // Exportamos JwtGuardia para usarlo en otros módulos
  exports: [JwtGuardia],
})
export class AuthModulo {}