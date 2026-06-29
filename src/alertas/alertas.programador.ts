import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { AlertasServicio } from './alertas.servicio';
import { AlertaVerificadorBase } from './verificadores/alerta-verificador.base';
import { VerificadorCalibracionVencida } from './verificadores/verificador-calibracion-vencida';
import { VerificadorCalibracionPorVencer } from './verificadores/verificador-calibracion-por-vencer';
import { VerificadorEquipoCriticoIndisponible } from './verificadores/verificador-equipo-critico-indisponible';
import { VerificadorDevolucionAtrasada } from './verificadores/verificador-devolucion-atrasada';

@Injectable()
export class AlertasProgramador {
  private readonly logger = new Logger(AlertasProgramador.name);

  // Registry: lista de todos los verificadores a ejecutar.
  // Agregar un nuevo tipo de alerta por tiempo = sumar una línea acá.
  private readonly verificadores: AlertaVerificadorBase[];

  constructor(
    private readonly prisma: PrismaService,
    private readonly alertasServicio: AlertasServicio,
  ) {
    // El programador instancia cada verificador pasándole las dependencias.
    this.verificadores = [
      new VerificadorCalibracionVencida(this.prisma, this.alertasServicio),
      new VerificadorCalibracionPorVencer(this.prisma, this.alertasServicio),
      new VerificadorEquipoCriticoIndisponible(this.prisma, this.alertasServicio),
      new VerificadorDevolucionAtrasada(this.prisma, this.alertasServicio),
    ];
  }

  // Corre todos los días a las 7:00 AM.
  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async verificarTodo(): Promise<void> {
    this.logger.log('Iniciando verificación diaria de alertas...');

    for (const verificador of this.verificadores) {
      try {
        await verificador.verificar();
      } catch (error) {
        // Si un verificador falla, los demás siguen corriendo.
        const mensaje = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Error en verificador ${verificador.constructor.name}: ${mensaje}`,
        );
      }
    }

    this.logger.log('Verificación diaria de alertas completada.');
  }
}