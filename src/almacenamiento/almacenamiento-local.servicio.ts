import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import {
  AlmacenamientoPuerto,
  GuardarParams,
  ArchivoGuardado,
} from './almacenamiento.puerto';

@Injectable()
export class AlmacenamientoLocalServicio implements AlmacenamientoPuerto {
  // Ruta base del almacenamiento, leída del entorno.
  // En Railway apuntará al volumen (ej: /data/documentos).
  // En tu máquina, si no está la variable, usa ./uploads
  private readonly rutaBase = process.env.RUTA_ALMACENAMIENTO ?? './uploads';

  async guardar(params: GuardarParams): Promise<ArchivoGuardado> {
    const { buffer, carpeta, nombreOriginal, mimeType } = params;

    // 1. Genero el nombre único del archivo.
    //    randomUUID() da algo como "a1b2c3d4-....". Le pego el nombre original
    //    al final para conservar la extensión y algo de legibilidad.
    //    saneo el nombre original para que no traiga barras ni caracteres raros.
    const nombreSaneado = nombreOriginal.replace(/[^a-zA-Z0-9._-]/g, '_');
    const nombreUnico = `${randomUUID()}-${nombreSaneado}`;

    // 2. La CLAVE es relativa a rutaBase: carpeta + nombre único.
    //    Esto es lo que se guarda en la base de datos (campo urlArchivo).
    //    Uso join para que arme "calibraciones/a1b2c3-cert.pdf" correctamente.
    const clave = join(carpeta, nombreUnico);

    // 3. El directorio físico donde va el archivo: rutaBase + carpeta.
    const directorioFisico = join(this.rutaBase, carpeta);

    // 4. La ruta física completa del archivo: rutaBase + clave.
    const rutaFisica = join(this.rutaBase, clave);

    // 5. Me aseguro de que el directorio exista.
    //    recursive: true crea toda la cadena de carpetas si falta,
    //    y NO tira error si ya existían.
    await fs.mkdir(directorioFisico, { recursive: true });

    // 6. Escribo el buffer al disco en esa ruta.
    await fs.writeFile(rutaFisica, buffer);

    // 7. Devuelvo la clave (para guardar en BD) y el tamaño real en bytes.
    //    buffer.length da la cantidad de bytes del archivo.
    return {
      clave,
      tamanoBytes: buffer.length,
    };
  }

  async obtener(clave: string): Promise<Buffer> {
    // Reconstruyo la ruta física combinando rutaBase con la clave guardada.
    const rutaFisica = join(this.rutaBase, clave);

    // fs.readFile sin encoding devuelve un Buffer (los bytes crudos del archivo).
    return fs.readFile(rutaFisica);
  }

  async eliminar(clave: string): Promise<void> {
    const rutaFisica = join(this.rutaBase, clave);

    // fs.unlink borra el archivo. Lo envuelvo en try/catch porque si el archivo
    // ya no existe, no quiero que reviente: el objetivo (que no esté) ya se cumplió.
    try {
      await fs.unlink(rutaFisica);
    } catch (error: any) {
      // ENOENT = "el archivo no existe". Ese caso lo ignoro a propósito.
      // Cualquier otro error (permisos, etc.) sí lo relanzo.
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}