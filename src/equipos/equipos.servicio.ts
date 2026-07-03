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
import { AuditoriaServicio, ACCIONES } from '../auditoria/auditoria.servicio';
import { UsuarioActual } from '../comun/tipos/usuario-actual.tipo';

@Injectable()
export class EquipoServicio {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emisorEventos: EventEmitter2,
    private readonly auditoriaServicio: AuditoriaServicio,
  ) {}

  async crear(dto: CrearEquipoDto, usuario: UsuarioActual) {
    const equipoExistente = await this.prisma.equipo.findUnique({
      where: { codigoInterno: dto.codigoInterno },
    });

    if (equipoExistente) {
      throw new ConflictException(
        `Ya existe un equipo con el código interno "${dto.codigoInterno}"`,
      );
    }

    const equipoCreado = await this.prisma.equipo.create({
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

    await this.auditoriaServicio.registrar({
      usuarioId: usuario.id,
      usuarioEmail: usuario.email,
      accion: ACCIONES.CREAR_EQUIPO,
      descripcion: `Creó el equipo "${equipoCreado.codigoInterno}" (${equipoCreado.descripcion})`,
      entidad: 'Equipo',
      entidadId: equipoCreado.id,
    });

    return equipoCreado;
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

  async actualizar(id: string, dto: ActualizarEquipoDto, usuario: UsuarioActual) {
    await this.obtenerPorId(id);

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

    const equipoActualizado = await this.prisma.equipo.update({
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

    await this.auditoriaServicio.registrar({
      usuarioId: usuario.id,
      usuarioEmail: usuario.email,
      accion: ACCIONES.EDITAR_EQUIPO,
      descripcion: `Editó el equipo "${equipoActualizado.codigoInterno}"`,
      entidad: 'Equipo',
      entidadId: equipoActualizado.id,
    });

    return equipoActualizado;
  }

async cambiarEstado(id: string, dto: CambiarEstadoDto, usuario: UsuarioActual) {
    const equipoAnterior = await this.obtenerPorId(id);

    const equipoActualizado = await this.prisma.equipo.update({
      where: { id },
      data: {
        estado: dto.estado,
        ...(dto.observaciones && { observaciones: dto.observaciones }),
      },
    });

    const payload: EventoEquipoEstadoCambiado = {
      equipoId: equipoActualizado.id,
      codigoInterno: equipoActualizado.codigoInterno,
      estadoAnterior: equipoAnterior.estado,
      estadoNuevo: equipoActualizado.estado,
      criticidad: equipoActualizado.criticidad,
    };

    this.emisorEventos.emit(EVENTOS.EQUIPO_ESTADO_CAMBIADO, payload);

    await this.auditoriaServicio.registrar({
      usuarioId: usuario.id,
      usuarioEmail: usuario.email,
      accion: ACCIONES.CAMBIAR_ESTADO_EQUIPO,
      descripcion: `Cambió el estado de "${equipoActualizado.codigoInterno}" de ${equipoAnterior.estado} a ${equipoActualizado.estado}`,
      entidad: 'Equipo',
      entidadId: equipoActualizado.id,
    });

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