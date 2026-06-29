// Nombres de los eventos del dominio, centralizados en un solo lugar.
// Emisor y oyente importan de acá → un typo lo agarra el compilador,
// no se descubre en runtime con un evento que nunca llega.
export const EVENTOS = {
  EQUIPO_ESTADO_CAMBIADO: 'equipo.estado.cambiado',
  CALIBRACION_REGISTRADA: 'calibracion.registrada',
  EQUIPO_DEVUELTO: 'equipo.devuelto',
} as const;