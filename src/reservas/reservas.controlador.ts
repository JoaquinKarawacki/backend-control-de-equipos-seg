import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ReservaServicio } from './reservas.servicio';
import { CrearReservaDto } from './dto/crear-reserva.dto';
import { EstadoReserva } from '@prisma/client';

@Controller('reservas')
export class ReservaControlador {
  constructor(private readonly reservaServicio: ReservaServicio) {}

  @Post()
  crear(@Body() dto: CrearReservaDto) {
    return this.reservaServicio.crear(dto);
  }

  @Patch(':id/confirmar')
  confirmar(@Param('id') id: string) {
    return this.reservaServicio.confirmar(id);
  }

  @Patch(':id/cancelar')
  cancelar(@Param('id') id: string) {
    return this.reservaServicio.cancelar(id);
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