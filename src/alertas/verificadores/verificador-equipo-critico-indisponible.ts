import { Equipo, TipoAlerta } from '@prisma/client';
import { AlertaVerificadorBase } from './alerta-verificador.base';

// Detecta equipos críticos (criticidad ALTA) que no están disponibles.
export class VerificadorEquipoCriticoIndisponible extends AlertaVerificadorBase {
  protected async obtenerEquiposAfectados(): Promise<Equipo[]> {
    return this.prisma.equipo.findMany({
      where: {
        criticidad: 'ALTA',
        estado: { not: 'DISPONIBLE' },
      },
    });
  }

  protected obtenerTipo(): TipoAlerta {
    return 'EQUIPO_CRITICO_INDISPONIBLE';
  }

  protected generarMensaje(equipo: Equipo): string {
    return `El equipo crítico ${equipo.codigoInterno} no está disponible (estado actual: ${equipo.estado}).`;
  }
}