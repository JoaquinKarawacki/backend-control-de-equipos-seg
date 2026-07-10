import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { FiltrarAlertasDto } from './dto/filtrar-alertas.dto';
import { TipoAlerta } from '@prisma/client';
import { EVENTOS } from './eventos/eventos.constantes';
import { CorreoServicio } from '../correo/correo.servicio';
import type {
  EventoEquipoEstadoCambiado,
  EventoCalibracionRegistrada,
  EventoEquipoDevuelto,
} from './eventos/eventos.tipos';

@Injectable()
export class AlertasServicio {
  constructor(
    private readonly prisma: PrismaService,
    private readonly correoServicio: CorreoServicio,
  ) {}

  // Única puerta de entrada para crear alertas. Si ya existe una activa
  // (resuelta: false) del mismo tipo para el mismo equipo, no hace nada.
  async crearAlertaSiNoExiste(tipo: TipoAlerta, equipoId: string, mensaje: string) {
    const alerta = await this.prisma.alerta.findFirst({
      where: {
        tipo: tipo,
        equipoId: equipoId,
        resuelta: false,
      },
    });

    if (alerta) return;

    const alertaCreada = await this.prisma.alerta.create({
      data: {
        tipo: tipo,
        equipoId: equipoId,
        mensaje: mensaje,
      },
    });

    await this.notificarPorCorreo(mensaje);

    return alertaCreada;
  }

  // Avisa por mail a administradores y técnicos cada vez que se crea una alerta nueva.
  private async notificarPorCorreo(mensaje: string) {
    const usuarios = await this.prisma.usuario.findMany({
      where: { rol: { in: ['ADMIN', 'TECNICO'] }, activo: true },
      select: { email: true },
    });

    await this.correoServicio.enviar(
      usuarios.map((usuario) => usuario.email),
      'Nueva alerta - Control de Equipos SEG',
      `<p>${mensaje}</p>`,
    );
  }

  // Marca como resueltas todas las alertas activas de los tipos indicados
  // para un equipo. La usan los eventos para auto-resolver.
  async resolverAlertasPorTipo(equipoId: string, tipos: TipoAlerta[]) {
    return this.prisma.alerta.updateMany({
      where: {
        equipoId: equipoId,
        tipo: { in: tipos },
        resuelta: false,
      },
      data: {
        resuelta: true,
      },
    });
  }

  async obtenerTodas(filtros: FiltrarAlertasDto) {
    return this.prisma.alerta.findMany({
      where: {
        ...(filtros.tipo && { tipo: filtros.tipo }),
        ...(filtros.equipoId && { equipoId: filtros.equipoId }),
        ...(filtros.leida !== undefined && { leida: filtros.leida }),
        ...(filtros.resuelta !== undefined && { resuelta: filtros.resuelta }),
      },
      include: { equipo: true },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async marcarLeida(id: string) {
    const alerta = await this.prisma.alerta.findUnique({
      where: { id },
    });

    if (!alerta) throw new NotFoundException('La alerta no existe');

    return this.prisma.alerta.update({
      where: { id },
      data: { leida: true },
    });
  }

  async marcarResuelta(id: string) {
    const alerta = await this.prisma.alerta.findUnique({
      where: { id },
    });

    if (!alerta) throw new NotFoundException('La alerta no existe');

    return this.prisma.alerta.update({
      where: { id },
      data: { resuelta: true },
    });
  }

  // ─────────────────────────────────────────────
  // LISTENERS DE EVENTOS (auto-resolución y creación por evento)
  // ─────────────────────────────────────────────

  // Reacciona cuando un equipo cambia de estado.
  // Un mismo evento puede crear o resolver distintas alertas según el estado nuevo.
  @OnEvent(EVENTOS.EQUIPO_ESTADO_CAMBIADO)
  async cuandoCambiaEstadoEquipo(evento: EventoEquipoEstadoCambiado) {
    // Si el equipo pasó a DAÑADO → crear alerta de equipo dañado
    if (evento.estadoNuevo === 'DAÑADO') {
      await this.crearAlertaSiNoExiste(
        'EQUIPO_DAÑADO',
        evento.equipoId,
        `El equipo ${evento.codigoInterno} fue marcado como dañado.`,
      );
    }

    // Si el equipo volvió a DISPONIBLE → resolver las alertas que ya no aplican
    if (evento.estadoNuevo === 'DISPONIBLE') {
      await this.resolverAlertasPorTipo(evento.equipoId, [
        'EQUIPO_DAÑADO',
        'EQUIPO_CRITICO_INDISPONIBLE',
      ]);
    }
  }

  // Reacciona cuando se registra una calibración: las alertas de calibración
  // de ese equipo ya no aplican.
  @OnEvent(EVENTOS.CALIBRACION_REGISTRADA)
  async cuandoSeRegistraCalibracion(evento: EventoCalibracionRegistrada) {
    await this.resolverAlertasPorTipo(evento.equipoId, [
      'CALIBRACION_VENCIDA',
      'CALIBRACION_POR_VENCER',
    ]);
  }

  // Reacciona cuando se devuelve un equipo: la devolución atrasada ya no aplica.
  @OnEvent(EVENTOS.EQUIPO_DEVUELTO)
  async cuandoSeDevuelveEquipo(evento: EventoEquipoDevuelto) {
    await this.resolverAlertasPorTipo(evento.equipoId, ['DEVOLUCION_ATRASADA']);
  }
}