import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// Constantes de acciones: dan la consistencia de un enum sin cambiar
// el tipo String en la base. Usá SIEMPRE estas constantes al registrar,
// nunca el string a mano (evita typos tipo "CREAR_EQIPO").
export const ACCIONES = {
  // Equipos
  CREAR_EQUIPO: 'CREAR_EQUIPO',
  EDITAR_EQUIPO: 'EDITAR_EQUIPO',
  CAMBIAR_ESTADO_EQUIPO: 'CAMBIAR_ESTADO_EQUIPO',
  // Reservas
  CREAR_RESERVA: 'CREAR_RESERVA',
  CONFIRMAR_RESERVA: 'CONFIRMAR_RESERVA',
  CANCELAR_RESERVA: 'CANCELAR_RESERVA',
  // Movimientos
  REGISTRAR_MOVIMIENTO: 'REGISTRAR_MOVIMIENTO',
  // Calibraciones
  REGISTRAR_CALIBRACION: 'REGISTRAR_CALIBRACION',
  ANULAR_CALIBRACION: 'ANULAR_CALIBRACION',
  // Documentos
  SUBIR_DOCUMENTO: 'SUBIR_DOCUMENTO',
  ELIMINAR_DOCUMENTO: 'ELIMINAR_DOCUMENTO',
  // Usuarios
  CREAR_USUARIO: 'CREAR_USUARIO',
  EDITAR_USUARIO: 'EDITAR_USUARIO',
} as const;

// Los datos que recibe registrar(). Objeto en vez de params sueltos,
// por lo mismo que en GuardarParams: legibilidad y fácil de extender.
export interface RegistrarAuditoriaParams {
  usuarioId?: string;
  usuarioEmail: string;
  accion: string;
  descripcion: string;
  entidad?: string;
  entidadId?: string;
}

@Injectable()
export class AuditoriaServicio {
  private readonly logger = new Logger(AuditoriaServicio.name);

  constructor(private readonly prisma: PrismaService) {}

  async registrar(params: RegistrarAuditoriaParams): Promise<void> {
    // try/catch que NUNCA relanza: si la auditoría falla, se loguea
    // pero no tumba la operación real que ya ocurrió.
    try {
      await this.prisma.auditoria.create({
        data: {
          usuarioId: params.usuarioId ?? null,
          usuarioEmail: params.usuarioEmail,
          accion: params.accion,
          descripcion: params.descripcion,
          entidad: params.entidad ?? null,
          entidadId: params.entidadId ?? null,
        },
      });
    } catch (error) {
      // Se traga el error a propósito. La auditoría es secundaria.
      this.logger.error(
        `Falló el registro de auditoría (${params.accion}): ${error}`,
      );
    }
  }

  // Consulta con filtros, para la ruta GET del controlador.
  async listar(filtros: {
    accion?: string;
    entidad?: string;
    usuarioEmail?: string;
  }) {
    return this.prisma.auditoria.findMany({
      where: {
        accion: filtros.accion,
        entidad: filtros.entidad,
        usuarioEmail: filtros.usuarioEmail,
      },
      orderBy: { creadoEn: 'desc' },
    });
  }
}