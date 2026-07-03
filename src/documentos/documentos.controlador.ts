import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { DocumentosServicio } from './documentos.servicio';
import { SubirDocumentoDto } from './dto/subir-documento.dto';
import { JwtGuardia } from '../auth/jwt.guardia';
import { RolesGuardia } from '../comun/guards/roles.guardia';
import { Roles } from '../comun/decoradores/roles.decorador';
import { RolUsuario } from '@prisma/client';

// Tipos MIME permitidos. Incluyo los de celular (jpeg, png, heic) + pdf.
const TIPOS_PERMITIDOS = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/webp',
];

// Límite de tamaño: 10 MB en bytes.
const TAMANO_MAXIMO = 10 * 1024 * 1024;

@Controller('documentos')
export class DocumentosControlador {
  constructor(private readonly documentosServicio: DocumentosServicio) {}

  @Post()
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles(RolUsuario.ADMIN, RolUsuario.TECNICO)
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: memoryStorage(),
      limits: { fileSize: TAMANO_MAXIMO },
      fileFilter: (req, file, callback) => {
        if (TIPOS_PERMITIDOS.includes(file.mimetype)) {
          callback(null, true); // aceptar
        } else {
          callback(
            new BadRequestException(
              `Tipo de archivo no permitido: ${file.mimetype}`,
            ),
            false, // rechazar
          );
        }
      },
    }),
  )
  async subir(
    @UploadedFile() archivo: Express.Multer.File,
    @Body() dto: SubirDocumentoDto,
    @Req() req: any,
  ) {
    return this.documentosServicio.subir(dto, archivo, {
      id: req.user.id,
      email: req.user.email,
    });
  }

  @Get('equipo/:equipoId')
  @UseGuards(JwtGuardia)
  async listarPorEquipo(@Param('equipoId') equipoId: string) {
    return this.documentosServicio.listarPorEquipo(equipoId);
  }

  @Get(':id/descargar')
  @UseGuards(JwtGuardia)
  async descargar(@Param('id') id: string, @Res() res: Response) {
    // 1. Busco el registro (lanza NotFound si no existe).
    const documento = await this.documentosServicio.obtenerPorId(id);

    // 2. Le pido al servicio el contenido binario (Buffer) vía el puerto.
    const contenido = await this.documentosServicio.obtenerContenido(id);

    // 3. Seteo headers para que el navegador sepa qué es y lo descargue.
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${documento.nombre}"`,
      'Content-Length': contenido.length,
    });

    // 4. Mando los bytes.
    res.send(contenido);
  }

  @Delete(':id')
  @UseGuards(JwtGuardia, RolesGuardia)
  @Roles(RolUsuario.ADMIN)
  async eliminar(@Param('id') id: string, @Req() req: any) {
    return this.documentosServicio.eliminar(id, {
      id: req.user.id,
      email: req.user.email,
    });
  }
}