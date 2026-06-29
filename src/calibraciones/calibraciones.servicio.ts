import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearCalibracionDto } from './dto/crear-calibracion.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTOS } from '../alertas/eventos/eventos.constantes';
import { EventoCalibracionRegistrada } from '../alertas/eventos/eventos.tipos';

@Injectable()
export class CalibracionServicio {
    constructor(
    private readonly prisma: PrismaService,
    private readonly emisorEventos: EventEmitter2) {}

   async crear(dto: CrearCalibracionDto) {
    const equipo = await this.prisma.equipo.findUnique({
      where: { id: dto.equipoId },
    });

    if (!equipo) throw new NotFoundException('El equipo no existe');

    // El equipo debe estar marcado como que requiere calibración
    if (!equipo.requiereCalibracion) {
      throw new BadRequestException(
        'Este equipo no requiere calibración. Activá "requiereCalibracion" en el equipo si corresponde.',
      );
    }

    const fechaRealizada = new Date(dto.fechaRealizada);

    // Determinar fecha de vencimiento:
    // 1) si el equipo tiene intervalo → se calcula automáticamente
    // 2) si no tiene intervalo → debe venir en el dto
    let fechaVencimiento: Date;
    if (equipo.intervaloCalibracionDias) {
      fechaVencimiento = new Date(fechaRealizada);
      fechaVencimiento.setDate(
        fechaVencimiento.getDate() + equipo.intervaloCalibracionDias,
      );
    } else if (dto.fechaVencimiento) {
      fechaVencimiento = new Date(dto.fechaVencimiento);
    } else {
      throw new BadRequestException(
        'El equipo no tiene intervalo de calibración configurado. Debés ingresar la fecha de vencimiento manualmente.',
      );
    }

    // Todo dentro de una transacción: o se guarda todo, o nada
    const calibracion = await this.prisma.$transaction(async (tx) => {
      const calibracionCreada = await tx.calibracion.create({
        data: {
          equipoId: dto.equipoId,
          registradaPorId: dto.registradaPorId,
          fechaRealizada,
          fechaVencimiento,
          laboratorio: dto.laboratorio,
          numeroCertificado: dto.numeroCertificado,
          observaciones: dto.observaciones,
        },
      });

      // Si el equipo estaba EN_CALIBRACION, vuelve a estar disponible o reservado
      let nuevoEstado = equipo.estado;
      if (equipo.estado === 'EN_CALIBRACION') {
        const reservaActiva = await tx.reserva.findFirst({
          where: { equipoId: dto.equipoId, estado: 'CONFIRMADA' },
        });
        nuevoEstado = reservaActiva ? 'RESERVADO' : 'DISPONIBLE';
      }

      await tx.equipo.update({
        where: { id: dto.equipoId },
        data: {
          fechaUltimaCalibracion: fechaRealizada,
          vencimientoCalibracion: fechaVencimiento,
          estado: nuevoEstado,
        },
      });

      return calibracionCreada;
    });

    // La transacción ya commiteó con éxito. Recién ahora avisamos.
    const payload: EventoCalibracionRegistrada = {
      equipoId: dto.equipoId,
    };
    this.emisorEventos.emit(EVENTOS.CALIBRACION_REGISTRADA, payload);

    return calibracion;
  }

    async obtenerTodas(equipoId?: string, registradaPorId?: string) {
      return this.prisma.calibracion.findMany({
        where: {
           anulada: false,
          ...(equipoId && { equipoId }),
          ...(registradaPorId && { registradaPorId }),
        },
        include: {
          equipo: true,
          registradaPor: true,
        },
        orderBy: {
          fechaRealizada: 'desc',
        },
      });
    }
    
    async obtenerPorId(id: string) {
    const calibracion = await this.prisma.calibracion.findUnique({
      where: { id },
      include: {
        equipo: true,
        registradaPor: true,
      },
    });

    if (!calibracion) throw new NotFoundException('La calibración no existe');

    return calibracion;
  }

    async anular(id: string, motivo: string) {
      const calibracion = await this.prisma.calibracion.findUnique({
        where: { id },
      });

    if (!calibracion) throw new NotFoundException('La calibración no existe');

    if (calibracion.anulada) {
      throw new BadRequestException('La calibración ya fue anulada');
    }

    return this.prisma.calibracion.update({
      where: { id },
      data: { anulada: true, motivoAnulacion: motivo },
    });
  }
}
