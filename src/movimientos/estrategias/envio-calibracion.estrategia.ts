import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoEquipo, MovimientoEquipo, TipoMovimiento } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { MovimientoEstrategia, ParametrosMovimiento } from './movimiento.estrategia';

@Injectable()
export class EnvioCalibracionEstrategia implements MovimientoEstrategia {
  constructor(private readonly prisma: PrismaService) {}

  async ejecutar(params: ParametrosMovimiento): Promise<MovimientoEquipo> {
    const { equipoId, tecnicoId, proyectoAsociado, observaciones } = params;

    const equipo = await this.prisma.equipo.findUnique({
      where: { id: equipoId },
    });

    if (!equipo) {
      throw new NotFoundException('El equipo no existe');
    }

    if (equipo.estado !== EstadoEquipo.DISPONIBLE) {
      throw new BadRequestException('El equipo no esta disponible');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.equipo.update({
        where: { id: equipoId },
        data: { estado: EstadoEquipo.EN_CALIBRACION },
      });

      return tx.movimientoEquipo.create({
        data: {
          tipo: TipoMovimiento.ENVIO_CALIBRACION,
          equipoId,
          tecnicoId,
          proyectoAsociado,
          observaciones,
          estadoAnterior: equipo.estado,
          estadoNuevo: EstadoEquipo.EN_CALIBRACION,
        },
      });
    });
  }
}