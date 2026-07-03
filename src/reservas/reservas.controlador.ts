import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtGuardia } from '../auth/jwt.guardia';
import { ReservaServicio } from './reservas.servicio';
import { CrearReservaDto } from './dto/crear-reserva.dto';
import { EstadoReserva } from '@prisma/client';

@Controller('reservas')
export class ReservaControlador {
  constructor(private readonly reservaServicio: ReservaServicio) {}

  @Post()
  @UseGuards(JwtGuardia)
  crear(@Body() dto: CrearReservaDto, @Req() req: any) {
    return this.reservaServicio.crear(dto, {
      id: req.user.id,
      email: req.user.email,
    });
  }

  @Patch(':id/confirmar')
  @UseGuards(JwtGuardia)
  confirmar(@Param('id') id: string, @Req() req: any) {
    return this.reservaServicio.confirmar(id, {
      id: req.user.id,
      email: req.user.email,
    });
  }

  @Patch(':id/cancelar')
  @UseGuards(JwtGuardia)
  cancelar(@Param('id') id: string, @Req() req: any) {
    return this.reservaServicio.cancelar(id, {
      id: req.user.id,
      email: req.user.email,
    });
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.reservaServicio.obtenerPorId(id);
  }

  @Get()
  obtenerTodas(
    @Query('equipoId') equipoId?: string,
    @Query('tecnicoId') tecnicoId?: string,
    @Query('estado') estado?: EstadoReserva,
  ) {
    return this.reservaServicio.obtenerTodas(equipoId, tecnicoId, estado);
  }
}