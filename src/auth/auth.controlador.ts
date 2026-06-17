import { Controller, Post, Body } from '@nestjs/common';
import { AuthServicio } from './auth.servicio';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthControlador {
  constructor(private readonly authServicio: AuthServicio) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authServicio.login(dto);
  }
}