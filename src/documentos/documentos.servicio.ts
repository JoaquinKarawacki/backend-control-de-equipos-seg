import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ALMACENAMIENTO_PUERTO } from '../almacenamiento/almacenamiento.puerto';
import type { AlmacenamientoPuerto } from '../almacenamiento/almacenamiento.puerto';
import { SubirDocumentoDto } from './dto/subir-documento.dto';
import { TipoDocumento } from '@prisma/client';
import 'multer';

// Tipo del archivo que llega desde Multer (memoryStorage).
// Lo que vas a usar: archivo.buffer, archivo.originalname, archivo.mimetype
type ArchivoSubido = Express.Multer.File;

@Injectable()
export class DocumentosServicio {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ALMACENAMIENTO_PUERTO)
    private readonly almacenamiento: AlmacenamientoPuerto,
  ) {}

  async subir(
    dto: SubirDocumentoDto,
    archivo: ArchivoSubido,
    subidoPorId: string,
  ) {
    // 1. Defensa: sin archivo no hay nada que guardar.
    if (!archivo) {
      throw new BadRequestException('No se recibió ningún archivo.');
    }

    // 2. El equipo tiene que existir: no colgamos documentos de un equipo fantasma.
    const equipo = await this.prisma.equipo.findUnique({
      where: { id: dto.equipoId },
    });
    if (!equipo) {
      throw new NotFoundException(
        `No existe un equipo con id ${dto.equipoId}.`,
      );
    }

    // 3. Si vino calibracionId, la calibración tiene que existir Y ser del MISMO equipo.
    //    Esto evita el dato incoherente: un certificado de DL-01 colgado de una
    //    calibración de DL-05.
    if (dto.calibracionId) {
      const calibracion = await this.prisma.calibracion.findUnique({
        where: { id: dto.calibracionId },
      });
      if (!calibracion) {
        throw new NotFoundException(
          `No existe una calibración con id ${dto.calibracionId}.`,
        );
      }
      if (calibracion.equipoId !== dto.equipoId) {
        throw new BadRequestException(
          'La calibración indicada no pertenece a ese equipo.',
        );
      }
    }

    // 4. Le pido al PUERTO que guarde el archivo. El servicio NO sabe cómo ni dónde
    //    se guarda físicamente: solo entrega el buffer y recibe una clave.
    //    Uso "documentos" como carpeta única (ver nota abajo sobre esta decisión).
    const { clave, tamanoBytes } = await this.almacenamiento.guardar({
      buffer: archivo.buffer,
      carpeta: 'documentos',
      nombreOriginal: archivo.originalname,
      mimeType: archivo.mimetype,
    });

    // 5. Guardo el registro en la base. urlArchivo guarda la CLAVE (no una ruta absoluta).
    //    nombre: si no mandaron uno legible, uso el nombre original del archivo.
    const documento = await this.prisma.documento.create({
      data: {
        nombre: dto.nombre ?? archivo.originalname,
        tipo: dto.tipo,
        urlArchivo: clave,
        tamanoBytes,
        equipoId: dto.equipoId,
        calibracionId: dto.calibracionId ?? null,
        subidoPorId,
      },
    });

    // 6. Devuelvo el documento creado.
    return documento;
  }

  async listarPorEquipo(equipoId: string) {
    return this.prisma.documento.findMany({
      where: { equipoId },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async obtenerPorId(id: string) {
    const documento = await this.prisma.documento.findUnique({
      where: { id },
    });
    if (!documento) {
      throw new NotFoundException(`No existe un documento con id ${id}.`);
    }
    return documento;
  }

  async eliminar(id: string) {
    // Primero lo busco (esto ya lanza NotFoundException si no existe).
    const documento = await this.obtenerPorId(id);

    // Orden elegido: registro primero, archivo después.
    // Razón: un registro que apunta a un archivo inexistente le explota en la cara
    // al usuario al descargar; un archivo huérfano en disco es inofensivo.
    // Además el borrado del archivo es idempotente (si no está, no falla).
    await this.prisma.documento.delete({ where: { id } });
    await this.almacenamiento.eliminar(documento.urlArchivo);

    return { mensaje: 'Documento eliminado.', id };
  }
  
  // Devuelve el contenido binario del archivo para servirlo en la descarga.
  async obtenerContenido(id: string): Promise<Buffer> {
    const documento = await this.obtenerPorId(id); // valida que exista
    return this.almacenamiento.obtener(documento.urlArchivo);
  }
}