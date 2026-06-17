import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// La estrategia le dice a Passport cómo validar el token JWT
// Extrae el token del header Authorization: Bearer <token>
// y verifica que esté firmado con el mismo JWT_SECRET
@Injectable()
export class JwtEstrategia extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  // Este método se llama automáticamente si el token es válido
  // Lo que retorna acá queda disponible como req.user en los controllers
  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      rol: payload.rol,
    };
  }
}