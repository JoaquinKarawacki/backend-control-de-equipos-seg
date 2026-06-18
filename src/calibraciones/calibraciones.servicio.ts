import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearCalibracionDto } from './dto/crear-calibracion.dto';


@Injectable()
export class CalibracionServicio {
    constructor(private readonly prisma: PrismaService) {}

    async crear(dto: CrearCalibracionDto) {
      const equipo = await this.prisma.equipo.findUnique({
        where: { id: dto.equipoId },
      });

      if (!equipo) throw new NotFoundException('El equipo no existe');

      const calibracion = await this.prisma.calibracion.create({
        data: {
          ...dto,
          fechaRealizada: new Date(dto.fechaRealizada),
          fechaVencimiento: new Date(dto.fechaVencimiento),
        },
      });

      await this.prisma.equipo.update({
        where: { id: dto.equipoId },
        data: {
          fechaUltimaCalibracion: new Date(dto.fechaRealizada),
          vencimientoCalibracion: new Date(dto.fechaVencimiento),
        },
      });

      if (equipo.estado === 'EN_CALIBRACION') {
        const reservaActiva = await this.prisma.reserva.findFirst({
          where: {
            equipoId: dto.equipoId,
            estado: 'CONFIRMADA',
          },
        });

        await this.prisma.equipo.update({
          where: { id: dto.equipoId },
          data: { estado: reservaActiva ? 'RESERVADO' : 'DISPONIBLE' },
        });
      }

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
