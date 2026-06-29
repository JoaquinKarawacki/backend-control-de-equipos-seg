import { Equipo, TipoAlerta } from '@prisma/client';
import { AlertaVerificadorBase } from './alerta-verificador.base';

// Detecta equipos EN_USO cuya reserva confirmada ya venció (fechaHasta pasada).
export class VerificadorDevolucionAtrasada extends AlertaVerificadorBase {
  protected async obtenerEquiposAfectados(): Promise<Equipo[]> {
    const hoy = new Date();

    return this.prisma.equipo.findMany({
      where: {
        estado: 'EN_USO',
        reservas: {
          some: {
            estado: 'CONFIRMADA',
            fechaHasta: { lt: hoy },
          },
        },
      },
    });
  }

  protected obtenerTipo(): TipoAlerta {
    return 'DEVOLUCION_ATRASADA';
  }

  protected generarMensaje(equipo: Equipo): string {
    return `El equipo ${equipo.codigoInterno} tiene una devolución atrasada. Debió devolverse y sigue en uso.`;
  }
}