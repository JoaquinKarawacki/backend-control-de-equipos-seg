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
import { AuditoriaServicio, ACCIONES } from '../auditoria/auditoria.servicio';
import { UsuarioActual } from '../comun/tipos/usuario-actual.tipo';

// Tipo del archivo que llega desde Multer (memoryStorage).
// Lo que vas a usar: archivo.buffer, archivo.originalname, archivo.mimetype
type ArchivoSubido = Express.Multer.File;

@Injectable()
export class DocumentosServicio {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ALMACENAMIENTO_PUERTO)
    private readonly almacenamiento: AlmacenamientoPuerto,
    private readonly auditoriaServicio: AuditoriaServicio,
  ) {}

  async subir(
    dto: SubirDocumentoDto,
    archivo: ArchivoSubido,
    usuario: UsuarioActual,
  ) {
    if (!archivo) {
      throw new BadRequestException('No se recibió ningún archivo.');
    }

    // Multer/busboy decodifica el nombre del archivo como latin1 aunque el
    // navegador lo mande en UTF-8 (bug conocido) — lo reinterpretamos acá.
    archivo.originalname = Buffer.from(archivo.originalname, 'latin1').toString('utf8');

    const equipo = await this.prisma.equipo.findUnique({
      where: { id: dto.equipoId },
    });
    if (!equipo) {
      throw new NotFoundException(`No existe un equipo con id ${dto.equipoId}.`);
    }

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

    const { clave, tamanoBytes } = await this.almacenamiento.guardar({
      buffer: archivo.buffer,
      carpeta: 'documentos',
      nombreOriginal: archivo.originalname,
      mimeType: archivo.mimetype,
    });

    const documento = await this.prisma.documento.create({
      data: {
        nombre: dto.nombre ?? archivo.originalname,
        tipo: dto.tipo,
        urlArchivo: clave,
        tamanoBytes,
        equipoId: dto.equipoId,
        calibracionId: dto.calibracionId ?? null,
        subidoPorId: usuario.id,
      },
    });

    await this.auditoriaServicio.registrar({
      usuarioId: usuario.id,
      usuarioEmail: usuario.email,
      accion: ACCIONES.SUBIR_DOCUMENTO,
      descripcion: `Subió el documento "${documento.nombre}" (${documento.tipo}) al equipo ${dto.equipoId}`,
      entidad: 'Documento',
      entidadId: documento.id,
    });

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

  async eliminar(id: string, usuario: UsuarioActual) {
    const documento = await this.obtenerPorId(id);

    await this.prisma.documento.delete({ where: { id } });
    await this.almacenamiento.eliminar(documento.urlArchivo);

    await this.auditoriaServicio.registrar({
      usuarioId: usuario.id,
      usuarioEmail: usuario.email,
      accion: ACCIONES.ELIMINAR_DOCUMENTO,
      descripcion: `Eliminó el documento "${documento.nombre}" del equipo ${documento.equipoId}`,
      entidad: 'Documento',
      entidadId: documento.id,
    });

    return { mensaje: 'Documento eliminado.', id };
  }
  
  // Devuelve el contenido binario del archivo para servirlo en la descarga.
  async obtenerContenido(id: string): Promise<Buffer> {
    const documento = await this.obtenerPorId(id); // valida que exista
    return this.almacenamiento.obtener(documento.urlArchivo);
  }
}