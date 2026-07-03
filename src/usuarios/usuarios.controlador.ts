import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { UsuarioServicio } from './usuarios.servicio';
import { JwtGuardia } from '../auth/jwt.guardia';
import { RolesGuardia } from '../comun/guards/roles.guardia';
import { Roles } from '../comun/decoradores/roles.decorador';
import { RolUsuario } from '@prisma/client';

@Controller('usuarios')
export class UsuarioControlador{
    constructor(private readonly usuarioServicio: UsuarioServicio) {}

    @Post()
    @UseGuards(JwtGuardia, RolesGuardia)
    @Roles(RolUsuario.ADMIN)
    crear(@Body() dto: CrearUsuarioDto, @Req() req: any){
        return this.usuarioServicio.crear(dto, {
            id: req.user.id,
            email: req.user.email,
        });
    }

    @UseGuards(JwtGuardia)
    @Get()
    obtenerTodos(){
        return this.usuarioServicio.obtenerTodos();
    }

    @Get(':id')
    obtenerPorId(@Param('id') id: string){
        return this.usuarioServicio.obtenerPorId(id);
    }

    @Patch(':id')
    @UseGuards(JwtGuardia, RolesGuardia)
    @Roles(RolUsuario.ADMIN)
    actualizar(@Param('id') id: string, @Body() dto: ActualizarUsuarioDto, @Req() req: any){
        return this.usuarioServicio.actualizar(id, dto, {
            id: req.user.id,
            email: req.user.email,
        })
    }
}