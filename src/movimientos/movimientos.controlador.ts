import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtGuardia } from '../auth/jwt.guardia';
import { RolesGuardia } from '../comun/guards/roles.guardia';
import { Roles } from '../comun/decoradores/roles.decorador';
import { RolUsuario } from '@prisma/client';
import { MovimientosServicio } from './movimientos.servicio';
import { RegistrarMovimientoDto } from './dto/registrar-movimiento.dto';
import { FiltrarMovimientosDto } from './dto/filtrar-movimineto.dto';

@Controller('movimientos')
@UseGuards(JwtGuardia, RolesGuardia)
export class MovimientosControlador {
  constructor(private readonly movimientosServicio: MovimientosServicio) {}

  @Post()
  @Roles(RolUsuario.ADMIN, RolUsuario.TECNICO)
  registrarMovimiento(@Body() dto: RegistrarMovimientoDto, @Req() req: any) {
    return this.movimientosServicio.registrarMovimiento(dto, {
      id: req.user.id,
      email: req.user.email,
    });
  }

  @Get()
  obtenerTodos(@Query() filtros: FiltrarMovimientosDto) {
    return this.movimientosServicio.obtenerTodos(filtros)
  }

  @Get('equipo/:equipoId')
  obtenerPorEquipo(@Param('equipoId') equipoId: string) {
    return this.movimientosServicio.obtenerPorEquipo(equipoId)
  }
}