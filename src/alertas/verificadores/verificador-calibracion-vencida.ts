import { Equipo, TipoAlerta } from '@prisma/client';
import { AlertaVerificadorBase } from './alerta-verificador.base';

// Detecta equipos cuya calibración YA venció (vencimientoCalibracion < hoy).
export class VerificadorCalibracionVencida extends AlertaVerificadorBase {
  protected async obtenerEquiposAfectados(): Promise<Equipo[]> {
    const hoy = new Date();

    return this.prisma.equipo.findMany({
      where: {
        requiereCalibracion: true,
        vencimientoCalibracion: {
          not: null,
          lt: hoy, // lt = "less than" → la fecha de vencimiento es anterior a hoy
        },
      },
    });
  }

  protected obtenerTipo(): TipoAlerta {
    return 'CALIBRACION_VENCIDA';
  }

  protected generarMensaje(equipo: Equipo): string {
    const fecha = equipo.vencimientoCalibracion?.toLocaleDateString('es-UY');
    return `La calibración del equipo ${equipo.codigoInterno} venció el ${fecha}.`;
  }
}