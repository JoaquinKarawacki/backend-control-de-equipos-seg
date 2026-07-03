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
import { RolesGuardia } from '../comun/guards/roles.guardia';
import { Roles } from '../comun/decoradores/roles.decorador';
import { RolUsuario } from '@prisma/client';
import { CalibracionServicio } from './calibraciones.servicio';
import { CrearCalibracionDto } from './dto/crear-calibracion.dto';

@Controller('calibraciones')
export class CalibracionControlador {
  constructor(private readonly calibracionServicio: CalibracionServicio) {}

  @Post()
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles(RolUsuario.ADMIN, RolUsuario.TECNICO)
  crear(@Body() dto: CrearCalibracionDto, @Req() req: any) {
    return this.calibracionServicio.crear(dto, {
      id: req.user.id,
      email: req.user.email,
    });
  }

  @Patch(':id/anular')
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles(RolUsuario.ADMIN)
  anular(@Param('id') id: string, @Body('motivo') motivo: string, @Req() req: any) {
    return this.calibracionServicio.anular(id, motivo, {
      id: req.user.id,
      email: req.user.email,
    });
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