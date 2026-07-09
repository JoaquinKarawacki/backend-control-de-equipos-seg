import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CambiarContrasenaDto {
  @IsString()
  @IsNotEmpty()
  contrasenaActual!: string;

  @IsString()
  @MinLength(6)
  contrasenaNueva!: string;
}
