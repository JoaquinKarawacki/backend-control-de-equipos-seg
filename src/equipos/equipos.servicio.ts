import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as qrcode from 'qrcode';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearEquipoDto } from './dto/crear-equipo.dto';
import { ActualizarEquipoDto } from './dto/actualizar-equipo.dto';
import { FiltrarEquiposDto } from './dto/filtrar-equipo.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTOS } from '../alertas/eventos/eventos.constantes';
import { EventoEquipoEstadoCambiado } from '../alertas/eventos/eventos.tipos';

@Injectable()
export class EquipoServicio {
    constructor(
    private readonly prisma: PrismaService,
    private readonly emisorEventos: EventEmitter2) {}

  async crear(dto: CrearEquipoDto) {
    // Verificar código interno único antes de intentar insertar
    const equipoExistente = await this.prisma.equipo.findUnique({
      where: { codigoInterno: dto.codigoInterno },
    });

    if (equipoExistente) {
      throw new ConflictException(
        `Ya existe un equipo con el código interno "${dto.codigoInterno}"`,
      );
    }

    return this.prisma.equipo.create({
      data: {
        ...dto,
        // Convertimos los strings ISO a objetos Date para PostgreSQL
        fechaUltimaCalibracion: dto.fechaUltimaCalibracion
          ? new Date(dto.fechaUltimaCalibracion)
          : undefined,
        vencimientoCalibracion: dto.vencimientoCalibracion
          ? new Date(dto.vencimientoCalibracion)
          : undefined,
      },
    });
  }

  async obtenerTodos(filtros: FiltrarEquiposDto) {
    return this.prisma.equipo.findMany({
      where: {
        // Spread condicional: solo agrega el filtro si el valor existe
        ...(filtros.estado && { estado: filtros.estado }),
        ...(filtros.criticidad && { criticidad: filtros.criticidad }),
        ...(filtros.busqueda && {
          OR: [
            {
              descripcion: {
                contains: filtros.busqueda,
                mode: 'insensitive',
              },
            },
            {
              marca: {
                contains: filtros.busqueda,
                mode: 'insensitive',
              },
            },
            {
              modelo: {
                contains: filtros.busqueda,
                mode: 'insensitive',
              },
            },
            {
              codigoInterno: {
                contains: filtros.busqueda,
                mode: 'insensitive',
              },
            },
          ],
        }),
      },
      orderBy: { codigoInterno: 'asc' },
    });
  }

  async obtenerPorId(id: string) {
    const equipo = await this.prisma.equipo.findUnique({
      where: { id },
      include: {
        // Última calibración registrada
        calibraciones: {
          orderBy: { fechaRealizada: 'desc' },
          take: 1,
        },
        // Reservas activas (pendientes o confirmadas)
        reservas: {
          where: {
            estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
          },
        },
      },
    });

    if (!equipo) {
      throw new NotFoundException(`Equipo con id "${id}" no encontrado`);
    }

    return equipo;
  }

  async actualizar(id: string, dto: ActualizarEquipoDto) {
    // Esto lanza NotFoundException si no existe — no necesitamos repetir la lógica
    await this.obtenerPorId(id);

    // Si cambia el código interno, verificar que no lo tenga otro equipo
    if (dto.codigoInterno) {
      const duplicado = await this.prisma.equipo.findFirst({
        where: {
          codigoInterno: dto.codigoInterno,
          NOT: { id },
        },
      });

      if (duplicado) {
        throw new ConflictException(
          `Ya existe otro equipo con el código interno "${dto.codigoInterno}"`,
        );
      }
    }

    return this.prisma.equipo.update({
      where: { id },
      data: {
        ...dto,
        fechaUltimaCalibracion: dto.fechaUltimaCalibracion
          ? new Date(dto.fechaUltimaCalibracion)
          : undefined,
        vencimientoCalibracion: dto.vencimientoCalibracion
          ? new Date(dto.vencimientoCalibracion)
          : undefined,
      },
    });
  }

 async cambiarEstado(id: string, dto: CambiarEstadoDto) {
    // Guardamos el equipo ANTES de cambiarlo: necesitamos el estado anterior
    // y sus datos para el payload del evento.
    const equipoAnterior = await this.obtenerPorId(id);

    const equipoActualizado = await this.prisma.equipo.update({
      where: { id },
      data: {
        estado: dto.estado,
        ...(dto.observaciones && { observaciones: dto.observaciones }),
      },
    });

    // El cambio ya está persistido. Recién ahora avisamos al resto del sistema.
    const payload: EventoEquipoEstadoCambiado = {
      equipoId: equipoActualizado.id,
      codigoInterno: equipoActualizado.codigoInterno,
      estadoAnterior: equipoAnterior.estado,
      estadoNuevo: equipoActualizado.estado,
      criticidad: equipoActualizado.criticidad,
    };

    this.emisorEventos.emit(EVENTOS.EQUIPO_ESTADO_CAMBIADO, payload);

    return equipoActualizado;
  }

  async generarQR(id: string) {
    const equipo = await this.obtenerPorId(id);

    // URL que va codificada dentro del QR — apunta a la ficha del equipo en el frontend
    const urlFrontend = process.env.FRONTEND_URL ?? 'http://localhost:3001';
    const urlEquipo = `${urlFrontend}/equipos/${equipo.id}`;

    // toDataURL genera un PNG en base64 — el frontend puede usarlo
    // directamente como <img src="data:image/png;base64,..." />
    const qrDataUrl = await qrcode.toDataURL(urlEquipo, {
      width: 300,
      margin: 2,
    });

    return {
      codigoInterno: equipo.codigoInterno,
      descripcion: equipo.descripcion,
      urlEquipo,
      qr: qrDataUrl,
    };
  }
}