import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoEquipo, EstadoReserva, MovimientoEquipo, TipoMovimiento } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { MovimientoEstrategia, ParametrosMovimiento } from './movimiento.estrategia';

@Injectable()
export class RetiroEstrategia implements MovimientoEstrategia {
  constructor(private readonly prisma: PrismaService) {}

  async ejecutar(params: ParametrosMovimiento): Promise<MovimientoEquipo> {
    const { equipoId, tecnicoId, reservaId, proyectoAsociado, observaciones } = params;

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
            },
        });
    });
  }
}