import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuardia } from '../auth/jwt.guardia';
import { RolesGuardia } from '../comun/guards/roles.guardia';
import { Roles } from '../comun/decoradores/roles.decorador';
import { RolUsuario } from '@prisma/client';
import { AlertasServicio } from './alertas.servicio';
import { FiltrarAlertasDto } from './dto/filtrar-alertas.dto';

@Controller('alertas')
@UseGuards(JwtGuardia)
export class AlertasControlador {
  constructor(private readonly alertasServicio: AlertasServicio) {}

  // GET /api/alertas?tipo=...&leida=...&resuelta=...&equipoId=...
  @Get()
  obtenerTodas(@Query() filtros: FiltrarAlertasDto) {
    return this.alertasServicio.obtenerTodas(filtros);
  }

  // PATCH /api/alertas/:id/leer
  @Patch(':id/leer')
  @UseGuards(RolesGuardia)
  @Roles(RolUsuario.ADMIN, RolUsuario.TECNICO)
  marcarLeida(@Param('id') id: string) {
    return this.alertasServicio.marcarLeida(id);
  }

  // PATCH /api/alertas/:id/resolver
  @Patch(':id/resolver')
  @UseGuards(RolesGuardia)
  @Roles(RolUsuario.ADMIN, RolUsuario.TECNICO)
  marcarResuelta(@Param('id') id: string) {
    return this.alertasServicio.marcarResuelta(id);
  }
}