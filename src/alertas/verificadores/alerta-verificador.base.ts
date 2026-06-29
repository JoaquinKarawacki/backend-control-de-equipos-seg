import { Equipo, TipoAlerta } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AlertasServicio } from '../alertas.servicio';

// Clase base abstracta — Template Method.
// Define el esqueleto de "verificar" una vez; las subclases rellenan los huecos.
export abstract class AlertaVerificadorBase {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly alertasServicio: AlertasServicio,
  ) {}

  // EL TEMPLATE: esqueleto fijo, no se sobreescribe.
  // 1) busca equipos afectados  2) crea alerta (con dedup) para cada uno
  async verificar(): Promise<void> {
    const equipos = await this.obtenerEquiposAfectados();

    for (const equipo of equipos) {
      await this.alertasServicio.crearAlertaSiNoExiste(
        this.obtenerTipo(),
        equipo.id,
        this.generarMensaje(equipo),
      );
    }
  }

  // LOS HUECOS: cada subclase los implementa a su manera.
  protected abstract obtenerEquiposAfectados(): Promise<Equipo[]>;
  protected abstract obtenerTipo(): TipoAlerta;
  protected abstract generarMensaje(equipo: Equipo): string;
}