import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { CambiarContrasenaDto } from './dto/cambiar-contrasena.dto';
import { AuditoriaServicio, ACCIONES } from '../auditoria/auditoria.servicio';
import { UsuarioActual } from '../comun/tipos/usuario-actual.tipo';

@Injectable()
export class UsuarioServicio{
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditoriaServicio: AuditoriaServicio,
    ) {}

   async crear(dto: CrearUsuarioDto, usuario: UsuarioActual){
        const usuarioExistente = await this.prisma.usuario.findUnique({
            where : {email: dto.email}
        });

        if(usuarioExistente){
            throw new ConflictException('Ya existe un usuario con ese email');
        }

       const contrasenaHasheada = await bcrypt.hash(dto.contrasena, 10);

        const usuarioCreado = await this.prisma.usuario.create({
            data: {
                ...dto,
                contrasena: contrasenaHasheada,
            },
        });

        await this.auditoriaServicio.registrar({
            usuarioId: usuario.id,
            usuarioEmail: usuario.email,
            accion: ACCIONES.CREAR_USUARIO,
            descripcion: `Creó el usuario "${usuarioCreado.email}" (rol: ${usuarioCreado.rol})`,
            entidad: 'Usuario',
            entidadId: usuarioCreado.id,
        });

        const { contrasena, ...usuarioSinContrasena } = usuarioCreado;

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

    async actualizar(id: string, dto: ActualizarUsuarioDto, usuario: UsuarioActual){
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
        const usuarioActualizado = await this.prisma.usuario.update({
            where : {id},
            data,
        });

        await this.auditoriaServicio.registrar({
            usuarioId: usuario.id,
            usuarioEmail: usuario.email,
            accion: ACCIONES.EDITAR_USUARIO,
            descripcion: `Editó el usuario "${usuarioActualizado.email}"`,
            entidad: 'Usuario',
            entidadId: usuarioActualizado.id,
        });

        const { contrasena, ...usuarioSinContrasena } = usuarioActualizado;
        return usuarioSinContrasena;
    }

    async cambiarContrasenaPropia(id: string, dto: CambiarContrasenaDto) {
        const usuario = await this.prisma.usuario.findUnique({ where: { id } });

        if (!usuario) {
            throw new NotFoundException('No existe un usuario con ese ID');
        }

        const contrasenaValida = await bcrypt.compare(dto.contrasenaActual, usuario.contrasena);

        if (!contrasenaValida) {
            throw new UnauthorizedException('La contraseña actual no es correcta');
        }

        const contrasenaHasheada = await bcrypt.hash(dto.contrasenaNueva, 10);

        await this.prisma.usuario.update({
            where: { id },
            data: { contrasena: contrasenaHasheada },
        });

        await this.auditoriaServicio.registrar({
            usuarioId: usuario.id,
            usuarioEmail: usuario.email,
            accion: ACCIONES.CAMBIAR_CONTRASENA_PROPIA,
            descripcion: `Cambió su propia contraseña`,
            entidad: 'Usuario',
            entidadId: usuario.id,
        });

        return { mensaje: 'Contraseña actualizada correctamente' };
    }

}