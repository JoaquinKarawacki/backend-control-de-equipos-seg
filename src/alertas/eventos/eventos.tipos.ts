import { EstadoEquipo, CriticidadEquipo } from '@prisma/client';

// Viaja cuando un equipo cambia de estado.
// El listener necesita: qué equipo, a qué estado fue (para decidir crear/resolver),
// y la criticidad (para saber si era un equipo crítico).
export interface EventoEquipoEstadoCambiado {
  equipoId: string;
  codigoInterno: string;
  estadoAnterior: EstadoEquipo;
  estadoNuevo: EstadoEquipo;
  criticidad: CriticidadEquipo;
}

// Viaja cuando se registra una calibración.
// El listener solo necesita saber de qué equipo, para resolver sus alertas de calibración.
export interface EventoCalibracionRegistrada {
  equipoId: string;
}

// Viaja cuando un equipo se devuelve.
// El listener solo necesita el equipo, para resolver DEVOLUCION_ATRASADA.
export interface EventoEquipoDevuelto {
  equipoId: string;
}