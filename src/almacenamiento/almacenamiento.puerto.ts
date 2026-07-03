export interface ArchivoGuardado {
  clave: string;
  tamanoBytes: number;
}

export interface GuardarParams {
  buffer: Buffer;
  carpeta: string;
  nombreOriginal: string;
  mimeType: string;
}

export interface AlmacenamientoPuerto {
  guardar(params: GuardarParams): Promise<ArchivoGuardado>;
  obtener(clave: string): Promise<Buffer>;
  eliminar(clave: string): Promise<void>;
}

export const ALMACENAMIENTO_PUERTO = 'ALMACENAMIENTO_PUERTO';