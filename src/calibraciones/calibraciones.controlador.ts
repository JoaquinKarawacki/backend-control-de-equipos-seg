import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CalibracionServicio } from './calibraciones.servicio';
import { CrearCalibracionDto } from './dto/crear-calibracion.dto';

@Controller('calibraciones')
export class CalibracionControlador {
  constructor(private readonly calibracionServicio: CalibracionServicio) {}

  @Post()
  crear(@Body() dto: CrearCalibracionDto) {
    return this.calibracionServicio.crear(dto);
  }

  @Patch(':id/anular')
  anular(@Param('id') id: string, @Body('motivo') motivo: string) {
    return this.calibracionServicio.anular(id, motivo);
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.calibracionServicio.obtenerPorId(id);
  }

  @Get()
  obtenerTodas(
    @Query('equipoId') equipoId?: string,
    @Query('registradaPorId') registradaPorId?: string,
  ) {
    return this.calibracionServicio.obtenerTodas(equipoId, registradaPorId);
  }
}