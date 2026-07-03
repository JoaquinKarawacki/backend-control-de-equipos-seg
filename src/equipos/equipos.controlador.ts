import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, Req,
} from '@nestjs/common';
import { JwtGuardia } from '../auth/jwt.guardia';
import { RolesGuardia } from '../comun/guards/roles.guardia';
import { Roles } from '../comun/decoradores/roles.decorador';
import { RolUsuario } from '@prisma/client';
import { EquipoServicio } from './equipos.servicio';
import { CrearEquipoDto } from './dto/crear-equipo.dto';
import { ActualizarEquipoDto } from './dto/actualizar-equipo.dto';
import { FiltrarEquiposDto } from './dto/filtrar-equipo.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';

@Controller('equipos')
export class EquipoControlador {
  constructor(private readonly equipoServicio: EquipoServicio) {}

  @Post()
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles(RolUsuario.ADMIN)
  crearEquipo(@Body() dto: CrearEquipoDto, @Req() req: any) {
    return this.equipoServicio.crear(dto, {
      id: req.user.id,
      email: req.user.email,
    });
  }

  @Get()
  obtenerTodos(@Query() filtros: FiltrarEquiposDto) {
    return this.equipoServicio.obtenerTodos(filtros);
  }

  // Ojo con el orden: :id va después de las rutas con sufijos fijos
  // Si pusieramos @Get(':id') antes de @Get(':id/qr'), NestJS
  // interpretaría "qr" como un id — por eso qr va primero
  @Get(':id/qr')
  generarQR(@Param('id') id: string) {
    return this.equipoServicio.generarQR(id);
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.equipoServicio.obtenerPorId(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles(RolUsuario.ADMIN)
    actualizarEquipo(
      @Param('id') id: string,
      @Body() dto: ActualizarEquipoDto,
      @Req() req: any,
    ) {
      return this.equipoServicio.actualizar(id, dto, {
        id: req.user.id,
        email: req.user.email,
      });
    }

   @Patch(':id/estado')
   @UseGuards(JwtGuardia, RolesGuardia)
   @Roles(RolUsuario.ADMIN, RolUsuario.TECNICO)
    cambiarEstado(
      @Param('id') id: string,
      @Body() dto: CambiarEstadoDto,
      @Req() req: any,
    ) {
      return this.equipoServicio.cambiarEstado(id, dto, {
        id: req.user.id,
        email: req.user.email,
      });
  }
}