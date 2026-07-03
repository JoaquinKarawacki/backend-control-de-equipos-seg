// Datos del usuario autenticado que los servicios necesitan para auditar.
// Salen de req.user (que el JwtGuardia deja disponible desde el token JWT),
// nunca del body del cliente — por eso no es un DTO.
export interface UsuarioActual {
  id: string;
  email: string;
}