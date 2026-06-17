import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum} from "class-validator";
import { RolUsuario  } from '@prisma/client';

export class CrearUsuarioDto {
    
    @IsString()
    @IsNotEmpty()
    nombre!: string;

    @IsString()
    @IsNotEmpty()
    apellido!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    contrasena!: string;

    @IsEnum(RolUsuario)
    @IsOptional()
    rol?: RolUsuario;

}