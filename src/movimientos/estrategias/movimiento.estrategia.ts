import { MovimientoEquipo } from '@prisma/client';

export interface ParametrosMovimiento {
  equipoId: string;
  tecnicoId: string;
  reservaId?: string;
  proyectoAsociado?: string;
  observaciones?: string;
  fechaDevolucionEsperada?: string;
}

export interface MovimientoEstrategia {
  ejecutar(params: ParametrosMovimiento): Promise<MovimientoEquipo>;
}