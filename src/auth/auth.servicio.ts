import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthServicio {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // Paso 1 — buscar el usuario por email
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    // Paso 2 — si no existe, error genérico (no decimos si el email o la contraseña es incorrecto)
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Paso 3 — comparar contraseña ingresada con el hash guardado
    const contrasenaValida = await bcrypt.compare(
      dto.contrasena,
      usuario.contrasena,
    );

    // Paso 4 — si no coincide, mismo error genérico
    if (!contrasenaValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Paso 5 — generar el token JWT con los datos del usuario
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }
}