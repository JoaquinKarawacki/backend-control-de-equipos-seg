import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoEquipo, EstadoReserva, MovimientoEquipo, TipoMovimiento } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { MovimientoEstrategia, ParametrosMovimiento } from './movimiento.estrategia';

@Injectable()
export class RetornoCalibracionEstrategia implements MovimientoEstrategia {
  constructor(private readonly prisma: PrismaService) {}

  async ejecutar(params: ParametrosMovimiento): Promise<MovimientoEquipo> {
    const { equipoId, tecnicoId, reservaId, proyectoAsociado, observaciones } = params;

    const equipo = await this.prisma.equipo.findUnique({
            where : {id: equipoId}
    })

    if(!equipo){
        throw new NotFoundException('El equipo no existe');
    }

    if (equipo.estado !== EstadoEquipo.EN_CALIBRACION) {
      throw new BadRequestException('El equipo no esta disponible');
    }
    
    const reservaActiva = await this.prisma.reserva.findFirst({
        where: {
            equipoId,
            estado: { in: [EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA] },
        },
    });

    const nuevoEstado = reservaActiva ? EstadoEquipo.RESERVADO : EstadoEquipo.DISPONIBLE;
    
    return this.prisma.$transaction(async (tx) => {
            await tx.equipo.update({
                where: { id: equipoId },
                data: { estado: nuevoEstado },
        });

    return tx.movimientoEquipo.create({
              data: {
              tipo: TipoMovimiento.RETORNO_CALIBRACION,
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
   }
}