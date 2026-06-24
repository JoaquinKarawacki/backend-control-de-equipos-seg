/*
  Warnings:

  - Added the required column `estadoAnterior` to the `movimientos_equipo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estadoNuevo` to the `movimientos_equipo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "movimientos_equipo" ADD COLUMN     "estadoAnterior" "EstadoEquipo" NOT NULL,
ADD COLUMN     "estadoNuevo" "EstadoEquipo" NOT NULL;
