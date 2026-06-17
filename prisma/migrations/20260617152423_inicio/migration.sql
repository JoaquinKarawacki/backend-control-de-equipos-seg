-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'TECNICO', 'SOLO_LECTURA');

-- CreateEnum
CREATE TYPE "EstadoEquipo" AS ENUM ('DISPONIBLE', 'RESERVADO', 'EN_USO', 'EN_CALIBRACION', 'FUERA_DE_SERVICIO', 'DAÑADO', 'EXTRAVIADO');

-- CreateEnum
CREATE TYPE "CriticidadEquipo" AS ENUM ('ALTA', 'MEDIA', 'BAJA');

-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('RETIRO', 'DEVOLUCION', 'ENVIO_CALIBRACION', 'RETORNO_CALIBRACION');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CERTIFICADO_CALIBRACION', 'FOTO', 'MANUAL', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoAlerta" AS ENUM ('CALIBRACION_POR_VENCER', 'CALIBRACION_VENCIDA', 'DEVOLUCION_ATRASADA', 'EQUIPO_DAÑADO', 'EQUIPO_CRITICO_INDISPONIBLE');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'TECNICO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipos" (
    "id" TEXT NOT NULL,
    "codigoInterno" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "numeroDeSerie" TEXT,
    "ubicacion" TEXT,
    "estado" "EstadoEquipo" NOT NULL DEFAULT 'DISPONIBLE',
    "criticidad" "CriticidadEquipo" NOT NULL DEFAULT 'MEDIA',
    "observaciones" TEXT,
    "fechaUltimaCalibración" TIMESTAMP(3),
    "vencimientoCalibración" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" TEXT NOT NULL,
    "estado" "EstadoReserva" NOT NULL DEFAULT 'PENDIENTE',
    "fechaDesde" TIMESTAMP(3) NOT NULL,
    "fechaHasta" TIMESTAMP(3) NOT NULL,
    "proyecto" TEXT,
    "observaciones" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "equipoId" TEXT NOT NULL,
    "tecnicoId" TEXT NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_equipo" (
    "id" TEXT NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proyectoAsociado" TEXT,
    "observaciones" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "equipoId" TEXT NOT NULL,
    "tecnicoId" TEXT NOT NULL,
    "reservaId" TEXT,

    CONSTRAINT "movimientos_equipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calibraciones" (
    "id" TEXT NOT NULL,
    "fechaRealizada" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "laboratorio" TEXT,
    "numeroCertificado" TEXT,
    "observaciones" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "equipoId" TEXT NOT NULL,
    "registradaPorId" TEXT,

    CONSTRAINT "calibraciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoDocumento" NOT NULL,
    "urlArchivo" TEXT NOT NULL,
    "tamanoBytes" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "equipoId" TEXT NOT NULL,
    "calibracionId" TEXT,
    "subidoPorId" TEXT NOT NULL,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas" (
    "id" TEXT NOT NULL,
    "tipo" "TipoAlerta" NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "resuelta" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "equipoId" TEXT NOT NULL,

    CONSTRAINT "alertas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "equipos_codigoInterno_key" ON "equipos"("codigoInterno");

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_equipo" ADD CONSTRAINT "movimientos_equipo_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_equipo" ADD CONSTRAINT "movimientos_equipo_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_equipo" ADD CONSTRAINT "movimientos_equipo_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calibraciones" ADD CONSTRAINT "calibraciones_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calibraciones" ADD CONSTRAINT "calibraciones_registradaPorId_fkey" FOREIGN KEY ("registradaPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_calibracionId_fkey" FOREIGN KEY ("calibracionId") REFERENCES "calibraciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
