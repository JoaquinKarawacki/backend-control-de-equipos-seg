import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '@prisma/client';

// Clave con la que se guarda y se lee la metadata. La exporto para que
// el RolesGuardia la use al leer (mismo string en los dos lados, sin typos).
export const ROLES_CLAVE = 'roles';

// El decorador: recibe los roles permitidos y los adjunta como metadata a la ruta.
// Uso: @Roles(RolUsuario.ADMIN)  o  @Roles(RolUsuario.ADMIN, RolUsuario.TECNICO)
export const Roles = (...roles: RolUsuario[]) =>
  SetMetadata(ROLES_CLAVE, roles);