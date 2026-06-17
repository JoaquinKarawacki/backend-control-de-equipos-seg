import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { EquiposService } from './equipos.servicio';
import { CrearEquipoDto } from './dto/crear-equipo.dto';
import { ActualizarEquipoDto } from './dto/actualizar-equipo.dto';
import { FiltrarEquiposDto } from './dto/filtrar-equipo.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';

@Controller('equipos')
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) {}

  @Post()
  crearEquipo(@Body() dto: CrearEquipoDto) {
    return this.equiposService.crearEquipo(dto);
  }

  @Get()
  obtenerTodos(@Query() filtros: FiltrarEquiposDto) {
    return this.equiposService.obtenerTodos(filtros);
  }

  // Ojo con el orden: :id va después de las rutas con sufijos fijos
  // Si pusieramos @Get(':id') antes de @Get(':id/qr'), NestJS
  // interpretaría "qr" como un id — por eso qr va primero
  @Get(':id/qr')
  generarQR(@Param('id') id: string) {
    return this.equiposService.generarQR(id);
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.equiposService.obtenerPorId(id);
  }

  @Patch(':id')
  actualizarEquipo(@Param('id') id: string, @Body() dto: ActualizarEquipoDto) {
    return this.equiposService.actualizarEquipo(id, dto);
  }

  @Patch(':id/estado')
  cambiarEstado(@Param('id') id: string, @Body() dto: CambiarEstadoDto) {
    return this.equiposService.cambiarEstado(id, dto);
  }
}