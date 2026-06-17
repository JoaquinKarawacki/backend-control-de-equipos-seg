/*
  Warnings:

  - You are about to drop the column `fechaUltimaCalibración` on the `equipos` table. All the data in the column will be lost.
  - You are about to drop the column `vencimientoCalibración` on the `equipos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "equipos" DROP COLUMN "fechaUltimaCalibración",
DROP COLUMN "vencimientoCalibración",
ADD COLUMN     "fechaUltimaCalibracion" TIMESTAMP(3),
ADD COLUMN     "vencimientoCalibracion" TIMESTAMP(3);
