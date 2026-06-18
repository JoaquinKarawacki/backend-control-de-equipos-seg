-- AlterTable
ALTER TABLE "calibraciones" ADD COLUMN     "anulada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "motivoAnulacion" TEXT;
