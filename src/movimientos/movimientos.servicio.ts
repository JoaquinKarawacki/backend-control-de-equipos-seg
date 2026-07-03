import { Injectable, BadRequestException } from '@nestjs/common';
import { TipoMovimiento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RegistrarMovimientoDto } from './dto/registrar-movimiento.dto';
import { FiltrarMovimientosDto } from './dto/filtrar-movimineto.dto';
import { MovimientoEstrategia } from './estrategias/movimiento.estrategia';
import { RetiroEstrategia } from './estrategias/retiro.estrategia';
import { DevolucionEstrategia } from './estrategias/devolucion.estrategia';
import { EnvioCalibracionEstrategia } from './estrategias/envio-calibracion.estrategia';
import { RetornoCalibracionEstrategia } from './estrategias/retorno-calibracion.estrategia';
import { AuditoriaServicio, ACCIONES } from '../auditoria/auditoria.servicio';
import { UsuarioActual } from '../comun/tipos/usuario-actual.tipo';

@Injectable()
export class MovimientosServicio {
  private readonly estrategias: Map<TipoMovimiento, MovimientoEstrategia>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly retiroEstrategia: RetiroEstrategia,
    private readonly devolucionEstrategia: DevolucionEstrategia,
    private readonly envioCalibracionEstrategia: EnvioCalibracionEstrategia,
    private readonly retornoCalibracionEstrategia: RetornoCalibracionEstrategia,
    private readonly auditoriaServicio: AuditoriaServicio,
  ) {
    this.estrategias = new Map<TipoMovimiento, MovimientoEstrategia>([
      [TipoMovimiento.RETIRO, this.retiroEstrategia],
      [TipoMovimiento.DEVOLUCION, this.devolucionEstrategia],
      [TipoMovimiento.ENVIO_CALIBRACION, this.envioCalibracionEstrategia],
      [TipoMovimiento.RETORNO_CALIBRACION, this.retornoCalibracionEstrategia],
    ]);
  }

  async registrarMovimiento(dto: RegistrarMovimientoDto, usuario: UsuarioActual) {
    const estrategia = this.estrategias.get(dto.tipo);
    if (!estrategia) {
      throw new BadRequestException(`Tipo de movimiento "${dto.tipo}" no soportado`);
    }

    const movimiento = await estrategia.ejecutar(dto);

    await this.auditoriaServicio.registrar({
      usuarioId: usuario.id,
      usuarioEmail: usuario.email,
      accion: ACCIONES.REGISTRAR_MOVIMIENTO,
      descripcion: `Registró un movimiento de tipo ${dto.tipo} sobre el equipo ${dto.equipoId}`,
      entidad: 'MovimientoEquipo',
      entidadId: movimiento.id,
    });

    return movimiento;
  }

  async obtenerTodos(filtros: FiltrarMovimientosDto) {
    return this.prisma.movimientoEquipo.findMany({
      where: {
        ...(filtros.equipoId && { equipoId: filtros.equipoId }),
        ...(filtros.tecnicoId && { tecnicoId: filtros.tecnicoId }),
        ...(filtros.tipo && { tipo: filtros.tipo }),
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async obtenerPorEquipo(equipoId: string) {
    return this.prisma.movimientoEquipo.findMany({
      where: { equipoId },
      orderBy: { fecha: 'desc' },
    });
  }
}