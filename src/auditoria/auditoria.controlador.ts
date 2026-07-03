import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditoriaServicio } from './auditoria.servicio';
import { JwtGuardia } from '../auth/jwt.guardia';

@Controller('api/auditoria')
export class AuditoriaControlador {
  constructor(private readonly auditoriaServicio: AuditoriaServicio) {}

  // Solo lectura: la auditoría se escribe sola desde otros servicios,
  // nunca por HTTP. Acá solo se consulta.
  @Get()
  @UseGuards(JwtGuardia)
  async listar(
    @Query('accion') accion?: string,
    @Query('entidad') entidad?: string,
    @Query('usuarioEmail') usuarioEmail?: string,
  ) {
    return this.auditoriaServicio.listar({ accion, entidad, usuarioEmail });
  }
}