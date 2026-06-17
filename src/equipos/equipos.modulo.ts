import { Module } from '@nestjs/common';
import { EquiposController } from './equipos.controlador';
import { EquiposService } from './equipos.servicio';

@Module({
  controllers: [EquiposController],
  providers: [EquiposService],
  exports: [EquiposService],
})
export class EquiposModule {}