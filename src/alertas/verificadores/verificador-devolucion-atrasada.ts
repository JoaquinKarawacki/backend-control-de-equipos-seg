import { Equipo, TipoAlerta } from '@prisma/client';
import { AlertaVerificadorBase } from './alerta-verificador.base';

// Detecta equipos EN_USO cuyo retiro vigente ya pasó su fecha límite de
// devolución: la fechaHasta de la reserva que lo originó si vino de una
// reserva, o la fechaDevolucionEsperada cargada a mano si no vino de ninguna.
export class VerificadorDevolucionAtrasada extends AlertaVerificadorBase {
  protected async obtenerEquiposAfectados(): Promise<Equipo[]> {
    const hoy = new Date();
    const equiposEnUso = await this.prisma.equipo.findMany({
      where: { estado: 'EN_USO' },
    });

    const afectados: Equipo[] = [];

    for (const equipo of equiposEnUso) {
      const ultimoRetiro = await this.prisma.movimientoEquipo.findFirst({
        where: { equipoId: equipo.id, tipo: 'RETIRO' },
        orderBy: { fecha: 'desc' },
        include: { reserva: true },
      });

      if (!ultimoRetiro) continue;

      const fechaLimite = ultimoRetiro.reserva?.fechaHasta ?? ultimoRetiro.fechaDevolucionEsperada;

      if (fechaLimite && fechaLimite < hoy) {
        afectados.push(equipo);
      }
    }

    return afectados;
  }

  protected obtenerTipo(): TipoAlerta {
    return 'DEVOLUCION_ATRASADA';
  }

  protected generarMensaje(equipo: Equipo): string {
    return `El equipo ${equipo.codigoInterno} tiene una devolución atrasada. Debió devolverse y sigue en uso.`;
  }
}