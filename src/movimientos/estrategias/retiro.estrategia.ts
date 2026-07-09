import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoEquipo, EstadoReserva, MovimientoEquipo, TipoMovimiento } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { MovimientoEstrategia, ParametrosMovimiento } from './movimiento.estrategia';

@Injectable()
export class RetiroEstrategia implements MovimientoEstrategia {
  constructor(private readonly prisma: PrismaService) {}

  async ejecutar(params: ParametrosMovimiento): Promise<MovimientoEquipo> {
    const { equipoId, tecnicoId, reservaId, proyectoAsociado, observaciones, fechaDevolucionEsperada } = params;

    const equipo = await this.prisma.equipo.findUnique({
            where : {id: equipoId}
    })

    if(!equipo){
        throw new NotFoundException('El equipo no existe');
    }

    if(equipo.estado!='DISPONIBLE' && equipo.estado!='RESERVADO'){
        throw new BadRequestException('El equipo no esta disponible')
    }

    if(reservaId){
        const reserva = await this.prisma.reserva.findUnique({
            where : {
                id: reservaId
            }
        })

        if(!reserva){
            throw new NotFoundException('La reserva no existe')
        }else if(reserva.equipoId !== equipoId){
            throw new BadRequestException('La reserva no pertenece al equipo')
        }
    } else if (!fechaDevolucionEsperada) {
        // Sin reserva no hay ninguna fecha límite guardada en otro lado —
        // sin esto, el retiro queda "en uso" para siempre sin poder avisar de un atraso.
        throw new BadRequestException(
            'Si el retiro no está ligado a una reserva, indicá una fecha de devolución esperada.',
        );
    }

    return this.prisma.$transaction(async (tx) => {
  await tx.equipo.update({
    where: { id: equipoId },
    data: { estado: EstadoEquipo.EN_USO },
  });

  if (reservaId) {
    await tx.reserva.update({
      where: { id: reservaId },
      data: { estado: EstadoReserva.COMPLETADA },
    });
  }

  return tx.movimientoEquipo.create({
            data: {
            tipo: TipoMovimiento.RETIRO,
            equipoId,
            tecnicoId,
            reservaId,
            proyectoAsociado,
            observaciones,
            estadoAnterior: equipo.estado,
            estadoNuevo: EstadoEquipo.EN_USO,
            fechaDevolucionEsperada: reservaId ? null : new Date(fechaDevolucionEsperada!),
            },
        });
    });
  }
}