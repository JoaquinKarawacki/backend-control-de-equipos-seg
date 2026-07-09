import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthServicio } from './auth.servicio';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthControlador {
  constructor(private readonly authServicio: AuthServicio) {}

  // Máximo 5 intentos cada 60s por IP — evita fuerza bruta de contraseñas.
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authServicio.login(dto);
  }
}