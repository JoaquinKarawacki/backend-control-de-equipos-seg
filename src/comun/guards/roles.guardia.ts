import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '@prisma/client';
import { ROLES_CLAVE } from '../decoradores/roles.decorador';

@Injectable()
export class RolesGuardia implements CanActivate {
  // Reflector es la herramienta de NestJS para LEER metadata que dejó un decorador.
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Leo los roles que la ruta declaró con @Roles(...).
    //    getAllAndOverride busca la metadata en el método y en la clase;
    //    si está en ambos, el método gana (más específico).
    const rolesRequeridos = this.reflector.getAllAndOverride<RolUsuario[]>(
      ROLES_CLAVE,
      [context.getHandler(), context.getClass()],
    );

    // 2. Si la ruta NO tiene @Roles, no hay restricción de rol: dejo pasar.
    //    (El JwtGuardia ya se encargó de exigir que esté logueado.)
    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    // 3. Saco el usuario que el JwtGuardia dejó en la request.
    const { user } = context.switchToHttp().getRequest();

    // 4. ¿El rol del usuario está entre los permitidos?
    const tienePermiso = rolesRequeridos.includes(user.rol);

    if (!tienePermiso) {
      throw new ForbiddenException(
        'No tenés permisos para realizar esta acción.',
      );
    }

    return true;
  }
}