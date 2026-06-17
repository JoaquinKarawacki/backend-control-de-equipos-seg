import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';

@Injectable()
export class UsuarioServicio{
    constructor(private readonly prisma: PrismaService) {}
    
    async crear(dto: CrearUsuarioDto){
        const usuarioExistente = await this.prisma.usuario.findUnique({
            where : {email: dto.email}
        });

        if(usuarioExistente){
            throw new ConflictException('Ya existe un usuario con ese email');
        }

       const contrasenaHasheada = await bcrypt.hash(dto.contrasena, 10);

        const usuario = await this.prisma.usuario.create({
            data: {
                ...dto,
                contrasena: contrasenaHasheada,
            },
        });
        const { contrasena, ...usuarioSinContrasena } = usuario;
        
        return usuarioSinContrasena;
    }

    async obtenerTodos() {
        return this.prisma.usuario.findMany({
            select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            rol: true,
            activo: true,
            creadoEn: true,
            actualizadoEn: true,
            },
        });
    }

    async obtenerPorId(id: string){
        const usuario = await this.prisma.usuario.findUnique({
            where : {id: id}
        })

        if(!usuario){
            throw new NotFoundException('No existe un usuario con ese ID');
        }

        const { contrasena, ...usuarioSinContrasena } = usuario
        return usuarioSinContrasena
    }

    async actualizar(id: string, dto: ActualizarUsuarioDto){
        await this.obtenerPorId(id);

        if(dto.email){
            const duplicado = await this.prisma.usuario.findFirst({
                where : {
                    email: dto.email,
                    NOT : {id}, 
                }, 
            });
            
            if (duplicado) {
                throw new ConflictException(
                `Ya existe otro usuario con ese emial`,
                );
            }
        }

        const data: any = { ...dto };

        if (dto.contrasena) {
        data.contrasena = await bcrypt.hash(dto.contrasena, 10);
        }
        return await this.prisma.usuario.update({
            where : {id},
            data,
        })
    }

}