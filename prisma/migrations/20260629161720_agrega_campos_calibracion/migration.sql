-- AlterTable
ALTER TABLE "equipos" ADD COLUMN     "intervaloCalibracionDias" INTEGER,
ADD COLUMN     "requiereCalibracion" BOOLEAN NOT NULL DEFAULT false;
