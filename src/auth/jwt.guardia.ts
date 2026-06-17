import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Este guard se usa como decorador en los endpoints protegidos:
// @UseGuards(JwtGuard)
// Si el token no existe o es inválido, devuelve 401 automáticamente
@Injectable()
export class JwtGuardia extends AuthGuard('jwt') {}