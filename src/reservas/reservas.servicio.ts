import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EstadoReserva } from '@prisma/client';
import { CrearReservaDto } from './dto/crear-reserva.dto';
import { AuditoriaServicio, ACCIONES } from '../auditoria/auditoria.servicio';
import { UsuarioActual } from '../comun/tipos/usuario-actual.tipo';

@Injectable()
export class ReservaServicio {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoriaServicio: AuditoriaServicio,
  ) {}

  async crear(dto: CrearReservaDto, usuario: UsuarioActual) {
    const equipo = await this.prisma.equipo.findUnique({
      where: { id: dto.equipoId },
    });

    if (!equipo) {
      throw new NotFoundException('No existe un equipo con ese id');
    }

    if (equipo.estado !== 'DISPONIBLE') {
      throw new BadRequestException(`El equipo no está disponible (estado actual: ${equipo.estado})`);
    }

    if (new Date(dto.fechaHasta) <= new Date(dto.fechaDesde)) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    if (equipo.vencimientoCalibracion && equipo.vencimientoCalibracion < new Date()) {
      throw new BadRequestException('El equipo tiene la calibración vencida');
    }

    const superposicion = await this.prisma.reserva.findFirst({
      where: {
        equipoId: dto.equipoId,
        estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
        AND: [
          { fechaDesde: { lt: new Date(dto.fechaHasta) } },
          { fechaHasta: { gt: new Date(dto.fechaDesde) } },
        ],
      },
    });

    if (superposicion) {
      throw new ConflictException('El equipo ya tiene una reserva en ese período');
    }

    const reservaCreada = await this.prisma.reserva.create({ data: dto });

    await this.auditoriaServicio.registrar({
      usuarioId: usuario.id,
      usuarioEmail: usuario.email,
      accion: ACCIONES.CREAR_RESERVA,
      descripcion: `Creó una reserva para el equipo "${equipo.codigoInterno}" del ${dto.fechaDesde} al ${dto.fechaHasta}`,
      entidad: 'Reserva',
      entidadId: reservaCreada.id,
    });

    return reservaCreada;
  }

  async confirmar(id: string, usuario: UsuarioActual) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id },
    });

    if (!reserva) {
      throw new NotFoundException('La reserva no existe');
    }

    if (reserva.estado !== 'PENDIENTE') {
      throw new BadRequestException(`Solo se pueden confirmar reservas en estado PENDIENTE (estado actual: ${reserva.estado})`);
    }

    const reservaConfirmada = await this.prisma.reserva.update({
      where: { id },
      data: { estado: 'CONFIRMADA' },
    });

    await this.prisma.equipo.update({
      where: { id: reserva.equipoId },
      data: { estado: 'RESERVADO' },
    });

    await this.auditoriaServicio.registrar({
      usuarioId: usuario.id,
      usuarioEmail: usuario.email,
      accion: ACCIONES.CONFIRMAR_RESERVA,
      descripcion: `Confirmó la reserva del equipo con id "${reserva.equipoId}"`,
      entidad: 'Reserva',
      entidadId: reservaConfirmada.id,
    });

    return { mensaje: 'Reserva confirmada correctamente' };
  }

  async cancelar(id: string, usuario: UsuarioActual) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id },
    });

    if (!reserva) {
      throw new NotFoundException('La reserva no existe');
    }

    if (reserva.estado === 'CANCELADA' || reserva.estado === 'COMPLETADA') {
      throw new BadRequestException('Esta reserva ya fue cancelada o completada');
    }

    const reservaCancelada = await this.prisma.reserva.update({
      where: { id },
      data: { estado: 'CANCELADA' },
    });

    const otrasReservas = await this.prisma.reserva.findMany({
      where: {
        equipoId: reserva.equipoId,
        estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
        NOT: { id },
      },
    });

    if (otrasReservas.length === 0) {
      await this.prisma.equipo.update({
        where: { id: reserva.equipoId },
        data: { estado: 'DISPONIBLE' },
      });
    }

    await this.auditoriaServicio.registrar({
      usuarioId: usuario.id,
      usuarioEmail: usuario.email,
      accion: ACCIONES.CANCELAR_RESERVA,
      descripcion: `Canceló la reserva del equipo con id "${reserva.equipoId}"`,
      entidad: 'Reserva',
      entidadId: reservaCancelada.id,
    });

    return { mensaje: 'Reserva cancelada correctamente' };
  }

  async obtenerPorId(id: string) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id },
      include: {
        equipo: true,
        tecnico: true,
      },
    });

    if (!reserva) {
      throw new NotFoundException('No existe la reserva');
    }

    return reserva;
  }

  async obtenerTodas(equipoId?: string, tecnicoId?: string, estado?: EstadoReserva) {
    return this.prisma.reserva.findMany({
      where: {
        ...(equipoId && { equipoId }),
        ...(tecnicoId && { tecnicoId }),
        ...(estado && { estado }),
      },
      include: {
        equipo: true,
        tecnico: true,
      },
    });
  }
}