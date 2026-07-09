import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoEquipo, EstadoReserva, MovimientoEquipo, TipoMovimiento } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import { EVENTOS } from '../../alertas/eventos/eventos.constantes';
import { EventoEquipoDevuelto } from '../../alertas/eventos/eventos.tipos';
import { MovimientoEstrategia, ParametrosMovimiento } from './movimiento.estrategia';

@Injectable()
export class DevolucionEstrategia implements MovimientoEstrategia {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emisorEventos: EventEmitter2,
  ) {}

  async ejecutar(params: ParametrosMovimiento): Promise<MovimientoEquipo> {

    const { equipoId, tecnicoId, reservaId, proyectoAsociado, observaciones } = params;
    
    const equipo = await this.prisma.equipo.findUnique({
            where : {id: equipoId}
    })

    if(!equipo){
        throw new NotFoundException('El equipo no existe');
    }
    
    if(equipo.estado!='EN_USO'){
        throw new BadRequestException('El equipo no esta disponible')
    }

    const reservaActiva = await this.prisma.reserva.findFirst({
        where: {
            equipoId,
            estado: { in: [EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA] },
        },
        });

    const nuevoEstado = reservaActiva ? EstadoEquipo.RESERVADO : EstadoEquipo.DISPONIBLE;
    
    const movimiento = await this.prisma.$transaction(async (tx) => {
        await tx.equipo.update({
            where: { id: equipoId },
            data: { estado: nuevoEstado },
    });

  return tx.movimientoEquipo.create({
            data: {
            tipo: TipoMovimiento.DEVOLUCION,
            equipoId,
            tecnicoId,
            reservaId,
            proyectoAsociado,
            observaciones,
            estadoAnterior: equipo.estado,
            estadoNuevo: nuevoEstado,
            },
        });
    });

    const payload: EventoEquipoDevuelto = { equipoId };
    this.emisorEventos.emit(EVENTOS.EQUIPO_DEVUELTO, payload);

    return movimiento;
  }
}