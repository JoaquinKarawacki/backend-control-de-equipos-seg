import { Equipo, TipoAlerta } from '@prisma/client';
import { AlertaVerificadorBase } from './alerta-verificador.base';

// Detecta equipos cuya calibración vence dentro de los próximos 30 días
// (todavía no venció, pero falta poco).
export class VerificadorCalibracionPorVencer extends AlertaVerificadorBase {
  protected async obtenerEquiposAfectados(): Promise<Equipo[]> {
    const hoy = new Date();

    const en30Dias = new Date(hoy);
    en30Dias.setDate(en30Dias.getDate() + 30);

    return this.prisma.equipo.findMany({
      where: {
        requiereCalibracion: true,
        vencimientoCalibracion: {
          gte: hoy,       // todavía no venció
          lte: en30Dias,  // pero vence dentro de los próximos 30 días
        },
      },
    });
  }

  protected obtenerTipo(): TipoAlerta {
    return 'CALIBRACION_POR_VENCER';
  }

  protected generarMensaje(equipo: Equipo): string {
    const fecha = equipo.vencimientoCalibracion?.toLocaleDateString('es-UY');
    return `La calibración del equipo ${equipo.codigoInterno} vence el ${fecha}.`;
  }
}