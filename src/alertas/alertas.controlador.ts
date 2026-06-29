import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { AlertasServicio } from './alertas.servicio';
import { FiltrarAlertasDto } from './dto/filtrar-alertas.dto';
import { AlertasProgramador } from './alertas.programador';

@Controller('alertas')
export class AlertasControlador {
  constructor(
    private readonly alertasServicio: AlertasServicio,
    private readonly programador: AlertasProgramador,
  ) {}

  // ⚠️ TEMPORAL — SOLO PARA PRUEBAS. Borrar antes de deployar.
  // Dispara la verificación diaria manualmente sin esperar al cron.
  @Post('probar-verificacion')
  async probarVerificacion() {
    await this.programador.verificarTodo();
    return { mensaje: 'Verificación ejecutada. Revisá GET /api/alertas' };
  }

  // GET /api/alertas?tipo=...&leida=...&resuelta=...&equipoId=...
  @Get()
  obtenerTodas(@Query() filtros: FiltrarAlertasDto) {
    return this.alertasServicio.obtenerTodas(filtros);
  }

  // PATCH /api/alertas/:id/leer
  @Patch(':id/leer')
  marcarLeida(@Param('id') id: string) {
    return this.alertasServicio.marcarLeida(id);
  }

  // PATCH /api/alertas/:id/resolver
  @Patch(':id/resolver')
  marcarResuelta(@Param('id') id: string) {
    return this.alertasServicio.marcarResuelta(id);
  }
}