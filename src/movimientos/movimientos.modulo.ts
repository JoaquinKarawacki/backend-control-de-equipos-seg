import { Module } from '@nestjs/common';
import { MovimientosControlador } from './movimientos.controlador';
import { MovimientosServicio } from './movimientos.servicio';
import { RetiroEstrategia } from './estrategias/retiro.estrategia';
import { DevolucionEstrategia } from './estrategias/devolucion.estrategia';
import { EnvioCalibracionEstrategia } from './estrategias/envio-calibracion.estrategia';
import { RetornoCalibracionEstrategia } from './estrategias/retorno-calibracion.estrategia';

@Module({
  controllers: [MovimientosControlador],
  providers: [
    MovimientosServicio,
    RetiroEstrategia,
    DevolucionEstrategia,
    EnvioCalibracionEstrategia,
    RetornoCalibracionEstrategia,
  ],
})
export class MovimientosModulo {}